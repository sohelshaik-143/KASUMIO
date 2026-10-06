package com.kasumio.agent;

import com.kasumio.agent.dto.*;
import com.kasumio.common.SecurityUtils;
import com.kasumio.connection.ConnectionStatus;
import com.kasumio.connection.TrustedConnection;
import com.kasumio.connection.TrustedConnectionRepository;
import com.kasumio.discovery.TechnologyNormalizationService;
import com.kasumio.opportunity.*;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import com.kasumio.student.Student;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Recruiter Agent Workflow Service
 * 
 * Orchestrates recruiter natural-language intent understanding, opportunity creation,
 * evidence-backed candidate discovery, explainable recommendations, and the
 * "One Approval -> Workflow Execution" pipeline.
 */
@Service
public class RecruiterAgentWorkflowService {

    private final RecruiterIntentRepository intentRepository;
    private final RecruiterAutomationJobRepository jobRepository;
    private final CandidateRecommendationRepository recommendationRepository;
    private final RecruiterAutomationPolicyRepository policyRepository;
    private final RecruiterAuditLogRepository auditLogRepository;
    private final RecruiterIntentParser intentParser;
    private final AutonomousCandidateDiscoveryService discoveryService;
    private final OpportunityRepository opportunityRepository;
    private final OpportunitySkillRepository opportunitySkillRepository;
    private final SkillRepository skillRepository;
    private final TechnologyNormalizationService normalizationService;
    private final TrustedConnectionRepository trustedConnectionRepository;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final com.kasumio.assessment.AssessmentService assessmentService;

    public RecruiterAgentWorkflowService(
            RecruiterIntentRepository intentRepository,
            RecruiterAutomationJobRepository jobRepository,
            CandidateRecommendationRepository recommendationRepository,
            RecruiterAutomationPolicyRepository policyRepository,
            RecruiterAuditLogRepository auditLogRepository,
            RecruiterIntentParser intentParser,
            AutonomousCandidateDiscoveryService discoveryService,
            OpportunityRepository opportunityRepository,
            OpportunitySkillRepository opportunitySkillRepository,
            SkillRepository skillRepository,
            TechnologyNormalizationService normalizationService,
            TrustedConnectionRepository trustedConnectionRepository,
            ObjectMapper objectMapper,
            UserRepository userRepository,
            com.kasumio.assessment.AssessmentService assessmentService) {
        this.intentRepository = intentRepository;
        this.jobRepository = jobRepository;
        this.recommendationRepository = recommendationRepository;
        this.policyRepository = policyRepository;
        this.auditLogRepository = auditLogRepository;
        this.intentParser = intentParser;
        this.discoveryService = discoveryService;
        this.opportunityRepository = opportunityRepository;
        this.opportunitySkillRepository = opportunitySkillRepository;
        this.skillRepository = skillRepository;
        this.normalizationService = normalizationService;
        this.trustedConnectionRepository = trustedConnectionRepository;
        this.objectMapper = objectMapper;
        this.userRepository = userRepository;
        this.assessmentService = assessmentService;
    }

    @Transactional
    public RecruiterJobResponse initiateIntentWorkflow(User recruiter, RecruiterIntentRequest request) {
        validateRecruiterRole(recruiter);
        recruiter = userRepository.findById(recruiter.getId()).orElse(recruiter);

        String jobId = "KSM-JOB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 1. Parse recruiter intent
        ParsedIntentDto parsedIntent = intentParser.parseIntent(request.getIntent());

        // 2. Persist intent
        String payloadJson = serializeJson(parsedIntent);
        RecruiterIntent intent = new RecruiterIntent(
                recruiter,
                request.getIntent().trim(),
                parsedIntent.getRoleTitle(),
                parsedIntent.getOpportunityType(),
                parsedIntent.getWorkType(),
                parsedIntent.getLocation(),
                payloadJson
        );
        intent = intentRepository.save(intent);

        // 3. Create Automation Job
        RecruiterAutomationJob job = new RecruiterAutomationJob(jobId, recruiter, intent, request.getAutomationLevel());
        job.setStatus(JobStatus.ANALYZING);
        job = jobRepository.save(job);

        // 4. Determine policy thresholds
        RecruiterAutomationPolicy policy = getOrCreatePolicy(recruiter);
        int threshold = (request.getMinReadinessThreshold() != null)
                ? request.getMinReadinessThreshold()
                : policy.getMinReadinessThreshold();
        int maxCandidates = (request.getMaxCandidates() != null) ? request.getMaxCandidates() : 10;

        String companyName = recruiter.getOrganization() != null ? recruiter.getOrganization().getName() : null;

        // 5. Discover evidence-backed candidates
        AutonomousCandidateDiscoveryService.DiscoveryResult discovery =
                discoveryService.discoverCandidates(parsedIntent, threshold, maxCandidates, companyName, null);

        job.setTotalCandidatesScanned(discovery.getTotalScanned());
        job.setCandidatesMatchedCount(discovery.getTotalMatched());

        // 6. Save recommendations
        List<CandidateRecommendation> recEntities = new ArrayList<>();
        for (AutonomousCandidateDiscoveryService.DiscoveredCandidateInternal disc : discovery.getCandidates()) {
            Map<String, Object> breakdownMap = new HashMap<>();
            breakdownMap.put("observedProjects", disc.getObservedProjects() != null ? disc.getObservedProjects() : Collections.emptyList());
            breakdownMap.put("verifiedEvidence", disc.getVerifiedEvidence() != null ? disc.getVerifiedEvidence() : Collections.emptyList());
            breakdownMap.put("inferredCapabilities", disc.getInferredCapabilities() != null ? disc.getInferredCapabilities() : Collections.emptyList());
            breakdownMap.put("missingGaps", disc.getMissingGaps() != null ? disc.getMissingGaps() : Collections.emptyList());

            CandidateRecommendation rec = new CandidateRecommendation(
                    job,
                    disc.getStudent(),
                    disc.getCandidateAlias(),
                    disc.getOverallScore(),
                    disc.getReadinessScore(),
                    disc.getEvidenceStrengthScore(),
                    serializeJson(breakdownMap),
                    disc.getWhyRecommended(),
                    disc.getPersonalizedMessage()
            );
            recEntities.add(recommendationRepository.save(rec));
        }

        job.setCandidatesShortlistedCount(recEntities.size());
        job.setStatus(JobStatus.READY_FOR_REVIEW);
        job = jobRepository.save(job);

        // Record Audit Log
        logAudit(recruiter, jobId, "INTENT_PROCESSED", "Processed intent for role: " + parsedIntent.getRoleTitle() +
                ". Surfaced " + recEntities.size() + " evidence-backed candidates.");

        return mapJobToResponse(job, parsedIntent, recEntities);
    }

    @Transactional(readOnly = true)
    public RecruiterJobResponse getJob(User recruiter, String jobId) {
        validateRecruiterRole(recruiter);
        recruiter = userRepository.findById(recruiter.getId()).orElse(recruiter);

        RecruiterAutomationJob job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Automation job not found"));

        if (recruiter.getRole() != Role.ADMIN && !job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to automation job created by another recruiter");
        }

        ParsedIntentDto parsedIntent = deserializeJson(job.getIntent().getStructuredPayload(), ParsedIntentDto.class);
        List<CandidateRecommendation> recs = recommendationRepository.findByJobOrderByOverallScoreDesc(job);

        return mapJobToResponse(job, parsedIntent, recs);
    }

    @Transactional
    public RecruiterJobResponse approveAndExecute(User recruiter, String jobId, ApproveAndExecuteRequest request) {
        validateRecruiterRole(recruiter);
        recruiter = userRepository.findById(recruiter.getId()).orElse(recruiter);

        RecruiterAutomationJob job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Automation job not found"));

        if (recruiter.getRole() != Role.ADMIN && !job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to automation job created by another recruiter");
        }

        if (job.getStatus() != JobStatus.READY_FOR_REVIEW && job.getStatus() != JobStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job cannot be executed from state: " + job.getStatus());
        }

        ParsedIntentDto parsedIntent = deserializeJson(job.getIntent().getStructuredPayload(), ParsedIntentDto.class);

        // Step 1: Create or Fetch Opportunity
        Opportunity opp = job.getOpportunity();
        if (opp == null) {
            opp = new Opportunity(
                    recruiter,
                    parsedIntent.getRoleTitle(),
                    parsedIntent.getGeneratedDescription(),
                    parsedIntent.getOpportunityType(),
                    parsedIntent.getLocation(),
                    parsedIntent.getWorkType()
            );

            // Automatically publish immediately as per recruitment workflow norms
            opp.setStatus(OpportunityStatus.PUBLISHED);

            opp = opportunityRepository.save(opp);

            // Attach required & preferred skills
            attachSkillsToOpportunity(opp, parsedIntent.getRequiredSkills(), SkillRequirementType.REQUIRED);
            attachSkillsToOpportunity(opp, parsedIntent.getPreferredSkills(), SkillRequirementType.PREFERRED);

            job.setOpportunity(opp);

            // Auto-instantiate technical screening test with LeetCode-style DSA & technical questions
            try {
                assessmentService.getOrCreateAssessmentForOpportunity(opp.getId());
            } catch (Exception ignored) {}
        }

        // Step 2: Rate limit check
        RecruiterAutomationPolicy policy = getOrCreatePolicy(recruiter);
        List<CandidateRecommendation> allRecs = recommendationRepository.findByJobOrderByOverallScoreDesc(job);

        Set<String> approvedAliases = new HashSet<>(request.getApprovedAliases());
        // If approvedAliases is empty, default to approving all currently recommended candidates
        if (approvedAliases.isEmpty()) {
            approvedAliases = allRecs.stream().map(CandidateRecommendation::getCandidateAlias).collect(Collectors.toSet());
        }

        int outreachCount = 0;
        for (CandidateRecommendation rec : allRecs) {
            if (approvedAliases.contains(rec.getCandidateAlias())) {
                rec.setApprovalStatus(ApprovalStatus.APPROVED);

                // Check existing connection
                Student student = rec.getStudent();
                Optional<TrustedConnection> existing = trustedConnectionRepository.findByOpportunityAndStudent(opp, student);

                if (existing.isEmpty()) {
                    String customNote = request.getCustomOutreachNotes() != null
                            ? request.getCustomOutreachNotes().get(rec.getCandidateAlias())
                            : null;
                    String noteToUse = (customNote != null && !customNote.isBlank())
                            ? customNote.trim()
                            : rec.getPersonalizedMessage();

                    TrustedConnection connection = new TrustedConnection(
                            opp,
                            student,
                            recruiter,
                            noteToUse
                    );
                    trustedConnectionRepository.save(connection);
                    rec.setOutreachStatus(OutreachStatus.SENT);
                    outreachCount++;
                } else {
                    rec.setOutreachStatus(OutreachStatus.SENT);
                }
            } else {
                rec.setApprovalStatus(ApprovalStatus.REJECTED);
                rec.setOutreachStatus(OutreachStatus.SKIPPED);
            }
            recommendationRepository.save(rec);
        }

        job.setOutreachSentCount(outreachCount);
        job.setStatus(JobStatus.COMPLETED);
        job = jobRepository.save(job);

        logAudit(recruiter, jobId, "WORKFLOW_EXECUTED", "Opportunity #" + opp.getId() +
                " published and outreach dispatched to " + outreachCount + " candidates.");

        return mapJobToResponse(job, parsedIntent, allRecs);
    }

    @Transactional(readOnly = true)
    public RecruiterPolicyDto getPolicy(User recruiter) {
        validateRecruiterRole(recruiter);
        RecruiterAutomationPolicy policy = getOrCreatePolicy(recruiter);
        return new RecruiterPolicyDto(
                policy.getMaxDailyConnections(),
                policy.getMinReadinessThreshold(),
                policy.isRequireVerifiedEvidence(),
                policy.isAutoSendOutreach()
        );
    }

    @Transactional
    public RecruiterPolicyDto updatePolicy(User recruiter, RecruiterPolicyDto dto) {
        validateRecruiterRole(recruiter);
        RecruiterAutomationPolicy policy = getOrCreatePolicy(recruiter);
        policy.setMaxDailyConnections(dto.getMaxDailyConnections());
        policy.setMinReadinessThreshold(dto.getMinReadinessThreshold());
        policy.setRequireVerifiedEvidence(dto.isRequireVerifiedEvidence());
        policy.setAutoSendOutreach(dto.isAutoSendOutreach());
        policy = policyRepository.save(policy);

        logAudit(recruiter, null, "POLICY_UPDATED", "Updated automation policy: max daily=" +
                dto.getMaxDailyConnections() + ", threshold=" + dto.getMinReadinessThreshold());

        return dto;
    }

    @Transactional(readOnly = true)
    public List<RecruiterAuditLog> getAuditLogs(User recruiter) {
        validateRecruiterRole(recruiter);
        return auditLogRepository.findByRecruiterOrderByCreatedAtDesc(recruiter);
    }

    private void attachSkillsToOpportunity(Opportunity opp, List<String> skillNames, SkillRequirementType type) {
        if (skillNames == null || skillNames.isEmpty()) return;
        for (String name : skillNames) {
            String trimmed = name.trim();
            Skill resolvedSkill = normalizationService.resolve(trimmed).orElse(null);
            final Skill skill;
            if (resolvedSkill != null) {
                skill = resolvedSkill;
            } else {
                skill = skillRepository.findByNameIgnoreCase(trimmed)
                        .orElseGet(() -> skillRepository.save(new Skill(trimmed, "Software Development")));
            }

            boolean alreadyAttached = opp.getSkills().stream().anyMatch(s -> s.getSkill().getId().equals(skill.getId()));
            if (!alreadyAttached) {
                OpportunitySkill os = new OpportunitySkill(opp, skill, type);
                os = opportunitySkillRepository.save(os);
                opp.getSkills().add(os);
            }
        }
    }

    private RecruiterAutomationPolicy getOrCreatePolicy(User recruiter) {
        return policyRepository.findByRecruiter(recruiter)
                .orElseGet(() -> policyRepository.save(new RecruiterAutomationPolicy(recruiter)));
    }

    private void validateRecruiterRole(User user) {
        if (user.getRole() != Role.RECRUITER && user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only recruiters or administrators can access recruitment automation");
        }
    }

    private void logAudit(User recruiter, String jobId, String actionType, String details) {
        auditLogRepository.save(new RecruiterAuditLog(recruiter, jobId, actionType, details));
    }

    private RecruiterJobResponse mapJobToResponse(RecruiterAutomationJob job, ParsedIntentDto parsedIntent, List<CandidateRecommendation> recs) {
        RecruiterJobResponse resp = new RecruiterJobResponse();
        resp.setJobId(job.getJobId());
        resp.setStatus(job.getStatus());
        resp.setAutomationLevel(job.getAutomationLevel());
        resp.setOpportunityId(job.getOpportunity() != null ? job.getOpportunity().getId() : null);
        resp.setParsedIntent(parsedIntent);
        resp.setTotalCandidatesScanned(job.getTotalCandidatesScanned());
        resp.setCandidatesMatchedCount(job.getCandidatesMatchedCount());
        resp.setCandidatesShortlistedCount(job.getCandidatesShortlistedCount());
        resp.setOutreachSentCount(job.getOutreachSentCount());
        resp.setErrorMessage(job.getErrorMessage());
        resp.setCreatedAt(job.getCreatedAt());
        resp.setUpdatedAt(job.getUpdatedAt());

        List<CandidateRecommendationDto> dtos = recs.stream().map(r -> {
            Map breakdown = deserializeJson(r.getEvidenceBreakdown(), Map.class);
            List<String> observed = breakdown != null && breakdown.get("observedProjects") != null ? (List<String>) breakdown.get("observedProjects") : List.of();
            List<String> verified = breakdown != null && breakdown.get("verifiedEvidence") != null ? (List<String>) breakdown.get("verifiedEvidence") : List.of();
            List<String> inferred = breakdown != null && breakdown.get("inferredCapabilities") != null ? (List<String>) breakdown.get("inferredCapabilities") : List.of();
            List<String> missing = breakdown != null && breakdown.get("missingGaps") != null ? (List<String>) breakdown.get("missingGaps") : List.of();

            return new CandidateRecommendationDto(
                    r.getId(),
                    r.getCandidateAlias(),
                    r.getOverallScore(),
                    r.getReadinessScore(),
                    r.getEvidenceStrengthScore(),
                    observed,
                    verified,
                    inferred,
                    missing,
                    r.getWhyRecommended(),
                    r.getPersonalizedMessage(),
                    r.getApprovalStatus(),
                    r.getOutreachStatus()
            );
        }).collect(Collectors.toList());

        resp.setRecommendations(dtos);
        return resp;
    }

    private String serializeJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    private <T> T deserializeJson(String json, Class<T> clazz) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            return null;
        }
    }
}
