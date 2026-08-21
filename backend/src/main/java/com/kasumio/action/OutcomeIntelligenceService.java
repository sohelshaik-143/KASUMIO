package com.kasumio.action;

import com.kasumio.action.dto.*;
import com.kasumio.discovery.DeterministicMatchScorer;
import com.kasumio.discovery.EvidenceCapabilityAnalyzer;
import com.kasumio.discovery.EvidenceCapabilityAnalyzer.TechnologyCapability;
import com.kasumio.evidence.Evidence;
import com.kasumio.evidence.EvidenceRepository;
import com.kasumio.evidence.Verification;
import com.kasumio.evidence.VerificationRepository;
import com.kasumio.goal.CareerGoal;
import com.kasumio.goal.CareerGoalRepository;
import com.kasumio.opportunity.Opportunity;
import com.kasumio.opportunity.OpportunityRepository;
import com.kasumio.opportunity.OpportunityStatus;
import com.kasumio.student.Student;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OutcomeIntelligenceService {

    private final EvidenceRepository evidenceRepository;
    private final VerificationRepository verificationRepository;
    private final CareerGoalRepository careerGoalRepository;
    private final OpportunityRepository opportunityRepository;
    private final CareerActionHistoryRepository historyRepository;
    private final OutcomeDecisionTraceRepository traceRepository;
    private final EvidenceCapabilityAnalyzer capabilityAnalyzer;
    private final DeterministicMatchScorer matchScorer;
    private final CareerActionService careerActionService;

    public OutcomeIntelligenceService(
            EvidenceRepository evidenceRepository,
            VerificationRepository verificationRepository,
            CareerGoalRepository careerGoalRepository,
            OpportunityRepository opportunityRepository,
            CareerActionHistoryRepository historyRepository,
            OutcomeDecisionTraceRepository traceRepository,
            EvidenceCapabilityAnalyzer capabilityAnalyzer,
            DeterministicMatchScorer matchScorer,
            CareerActionService careerActionService) {
        this.evidenceRepository = evidenceRepository;
        this.verificationRepository = verificationRepository;
        this.careerGoalRepository = careerGoalRepository;
        this.opportunityRepository = opportunityRepository;
        this.historyRepository = historyRepository;
        this.traceRepository = traceRepository;
        this.capabilityAnalyzer = capabilityAnalyzer;
        this.matchScorer = matchScorer;
        this.careerActionService = careerActionService;
    }

    /**
     * Computes the complete Evidence -> Outcome Intelligence summary for a student.
     */
    @Transactional(readOnly = true)
    public OutcomeIntelligenceDto getOutcomeIntelligence(Student student) {
        List<Evidence> evidenceList = evidenceRepository.findByStudentOrderByCreatedAtDesc(student);
        List<CareerGoal> goals = careerGoalRepository.findByStudentOrderByTitleAsc(student);
        String targetGoalTitle = goals.isEmpty() ? "Software Engineer" : goals.get(0).getTargetRole();

        int totalEvidence = evidenceList.size();
        int verifiedCount = 0;
        int staleCount = 0;

        Instant hundredEightyDaysAgo = Instant.now().minus(180, ChronoUnit.DAYS);

        for (Evidence e : evidenceList) {
            boolean isVerified = verificationRepository.existsByEvidenceId(e.getId());
            if (isVerified) {
                verifiedCount++;
            }
            if (e.getCreatedAt().isBefore(hundredEightyDaysAgo) && !isVerified) {
                staleCount++;
            }
        }

        List<CareerActionHistory> completedHistory = historyRepository.findByStudentAndStatus(student, "COMPLETED");
        int completedActions = completedHistory.size();

        Map<Long, TechnologyCapability> capabilities = capabilityAnalyzer.analyzeStudentCapabilities(student);

        // Compute Opportunity Impact deterministically across published opportunities
        List<Opportunity> publishedOpps = opportunityRepository.findAll().stream()
                .filter(o -> o.getStatus() == OpportunityStatus.PUBLISHED)
                .collect(Collectors.toList());

        int strongMatchesCount = 0;
        for (Opportunity opp : publishedOpps) {
            DeterministicMatchScorer.MatchResult result = matchScorer.calculateMatch(student, opp);
            if ("Strong Match".equalsIgnoreCase(result.getMatchCategory()) || result.getOverallScore() >= 75) {
                strongMatchesCount++;
            }
        }

        // Build capability transitions
        List<CapabilityTransitionDto> transitions = new ArrayList<>();
        for (TechnologyCapability cap : capabilities.values()) {
            Optional<Evidence> primaryEvOpt = evidenceList.stream()
                    .filter(e -> e.getSkill().getId().equals(cap.getSkill().getId()))
                    .findFirst();

            String evTitle = primaryEvOpt.map(Evidence::getTitle).orElse("Action Demonstrated");
            String evUrl = primaryEvOpt.map(Evidence::getEvidenceUrl).orElse(null);
            boolean verified = cap.isVerified();

            String verifierOrg = null;
            if (primaryEvOpt.isPresent()) {
                Optional<Verification> vOpt = verificationRepository.findByEvidenceId(primaryEvOpt.get().getId());
                if (vOpt.isPresent()) {
                    verifierOrg = vOpt.get().getOrganization().getName();
                }
            }

            String beforeLevel = "UNKNOWN";
            if (cap.getEvidenceCount() > 1) {
                beforeLevel = cap.isVerified() ? "STRONG" : "MODERATE";
            } else if (cap.getEvidenceCount() == 1) {
                beforeLevel = "WEAK";
            }

            String afterLevel = cap.getEvidenceLevel().name();

            transitions.add(new CapabilityTransitionDto(
                    cap.getSkill().getName(),
                    cap.getSkill().getCategory() != null ? cap.getSkill().getCategory() : "Technology",
                    beforeLevel,
                    afterLevel,
                    Math.max(0.0, cap.getConfidenceScore() - 0.25),
                    cap.getConfidenceScore(),
                    evTitle,
                    evUrl,
                    verified,
                    verifierOrg,
                    verified ? "VERIFIED_EVIDENCE_DIRECT_PROMOTION" : "DEMONSTRATED_EVIDENCE_SUBMISSION",
                    cap.getExplanation(),
                    primaryEvOpt.map(e -> LocalDateTime.ofInstant(e.getCreatedAt(), ZoneId.systemDefault())).orElse(LocalDateTime.now())
            ));
        }

        // Fetch recent decision traces
        List<OutcomeDecisionTrace> traces = traceRepository.findByStudentOrderByCreatedAtDesc(student);
        List<DecisionTraceDto> traceDtos = traces.stream()
                .limit(10)
                .map(this::mapToTraceDto)
                .collect(Collectors.toList());

        // Get latest Visual Flow from CareerActionService
        CareerActionResponseDto actionResp = careerActionService.findNextBestAction(student);
        VisualFlowDto flow = actionResp.getVisualFlow();

        String readinessSummary = String.format(
                "Based on %d verified evidence artifact(s) and %d completed action(s), your demonstrated capability aligns with %d target opportunities.",
                verifiedCount, completedActions, strongMatchesCount
        );

        return new OutcomeIntelligenceDto(
                targetGoalTitle,
                totalEvidence,
                verifiedCount,
                staleCount,
                completedActions,
                strongMatchesCount,
                readinessSummary,
                transitions,
                traceDtos,
                flow
        );
    }

    /**
     * Retrieves full chronological decision traces for student.
     */
    @Transactional(readOnly = true)
    public List<DecisionTraceDto> getDecisionTraces(Student student) {
        return traceRepository.findByStudentOrderByCreatedAtDesc(student).stream()
                .map(this::mapToTraceDto)
                .collect(Collectors.toList());
    }

    /**
     * Record evidence creation decision trace.
     */
    @Transactional
    public void recordEvidenceCreated(Student student, Evidence evidence) {
        String skillName = evidence.getSkill().getName();
        int impactCount = calculateSkillOpportunityImpact(student, skillName);

        OutcomeDecisionTrace trace = new OutcomeDecisionTrace(
                student,
                "EVIDENCE_SUBMITTED",
                skillName,
                "UNKNOWN",
                "MODERATE",
                evidence != null ? evidence.getId() : null,
                null,
                null,
                impactCount,
                "DIRECT_EVIDENCE_SUBMISSION",
                "Submitted genuine evidence artifact for " + skillName + " (" + evidence.getEvidenceType().name() + "). Opportunity readiness updated."
        );
        traceRepository.save(trace);
    }

    /**
     * Record evidence deletion & trigger rollback decision trace.
     */
    @Transactional
    public void recordEvidenceDeleted(Student student, String skillName, Long evidenceId) {
        int impactCount = calculateSkillOpportunityImpact(student, skillName);

        OutcomeDecisionTrace trace = new OutcomeDecisionTrace(
                student,
                "EVIDENCE_DELETED",
                skillName,
                "STRONG",
                "UNKNOWN",
                evidenceId,
                null,
                null,
                impactCount,
                "EVIDENCE_REMOVAL_ROLLBACK",
                "Evidence artifact for " + skillName + " was deleted. Capability and opportunity match scores rolled back."
        );
        traceRepository.save(trace);
    }

    /**
     * Record evidence verification decision trace.
     */
    @Transactional
    public void recordEvidenceVerified(Student student, Evidence evidence, Long verificationId, String orgName) {
        String skillName = evidence.getSkill().getName();
        int impactCount = calculateSkillOpportunityImpact(student, skillName);

        OutcomeDecisionTrace trace = new OutcomeDecisionTrace(
                student,
                "EVIDENCE_VERIFIED",
                skillName,
                "MODERATE",
                "VERIFIED",
                evidence != null ? evidence.getId() : null,
                verificationId,
                null,
                impactCount,
                "ORGANIZATION_VERIFICATION_PROMOTION",
                "Evidence for " + skillName + " was formally verified by " + orgName + ". Maximum capability level achieved."
        );
        traceRepository.save(trace);
    }

    /**
     * Record verification rejection decision trace.
     */
    @Transactional
    public void recordVerificationRejected(Student student, Evidence evidence, String recruiterComment) {
        String skillName = evidence.getSkill().getName();
        int impactCount = calculateSkillOpportunityImpact(student, skillName);

        String commentNote = (recruiterComment != null && !recruiterComment.isBlank()) ? " Comment: " + recruiterComment : "";

        OutcomeDecisionTrace trace = new OutcomeDecisionTrace(
                student,
                "EVIDENCE_REJECTED",
                skillName,
                "MODERATE",
                "WEAK",
                evidence != null ? evidence.getId() : null,
                null,
                null,
                impactCount,
                "VERIFICATION_REJECTED_DEMOTION",
                "Verification request for " + skillName + " was rejected by reviewer." + commentNote
        );
        traceRepository.save(trace);
    }

    /**
     * Record action completion decision trace.
     */
    @Transactional
    public void recordActionCompleted(Student student, String actionId, String actionTitle, String skillName, Evidence evidence) {
        int impactCount = calculateSkillOpportunityImpact(student, skillName);

        OutcomeDecisionTrace trace = new OutcomeDecisionTrace(
                student,
                "ACTION_COMPLETED",
                skillName != null ? skillName : "Career Goal Action",
                "RECOMMENDED",
                "COMPLETED",
                evidence != null ? evidence.getId() : null,
                null,
                actionId,
                impactCount,
                "ACTION_LIFECYCLE_COMPLETION",
                "Completed career action: '" + actionTitle + "'. Evidence attached."
        );
        traceRepository.save(trace);
    }

    private int calculateSkillOpportunityImpact(Student student, String skillName) {
        if (skillName == null || skillName.isBlank()) return 1;
        try {
            List<Opportunity> publishedOpps = opportunityRepository.findAll().stream()
                    .filter(o -> o.getStatus() == OpportunityStatus.PUBLISHED)
                    .collect(Collectors.toList());

            int count = 0;
            for (Opportunity opp : publishedOpps) {
                if (opp.getSkills() != null) {
                    boolean requiresSkill = opp.getSkills().stream()
                            .filter(os -> os != null && os.getSkill() != null && os.getSkill().getName() != null)
                            .anyMatch(os -> os.getSkill().getName().equalsIgnoreCase(skillName));
                    if (requiresSkill) {
                        count++;
                    }
                }
            }
            return Math.max(count, 1);
        } catch (Exception e) {
            return 1;
        }
    }

    private DecisionTraceDto mapToTraceDto(OutcomeDecisionTrace trace) {
        String evTitle = null;
        if (trace.getEvidenceId() != null) {
            evTitle = evidenceRepository.findById(trace.getEvidenceId()).map(Evidence::getTitle).orElse(null);
        }
        return new DecisionTraceDto(
                trace.getId(),
                trace.getTraceType(),
                trace.getTargetSkillName(),
                trace.getBeforeState(),
                trace.getAfterState(),
                trace.getEvidenceId(),
                evTitle,
                trace.getVerificationId(),
                trace.getActionId(),
                trace.getOpportunityImpactCount(),
                trace.getRuleApplied(),
                trace.getExplanation(),
                trace.getCreatedAt()
        );
    }
}
