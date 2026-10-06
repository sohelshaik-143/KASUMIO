package com.kasumio.agent;

import com.kasumio.agent.ApprovalStatus;
import com.kasumio.agent.OutreachStatus;
import com.kasumio.agent.dto.CandidateRecommendationDto;
import com.kasumio.agent.dto.ParsedIntentDto;
import com.kasumio.assessment.AssessmentAttempt;
import com.kasumio.assessment.AssessmentAttemptRepository;
import com.kasumio.assessment.AttemptStatus;
import com.kasumio.connection.TrustedConnectionRepository;
import com.kasumio.discovery.EvidenceCapabilityAnalyzer;
import com.kasumio.discovery.TechnologyNormalizationService;
import com.kasumio.discovery.TechnologyRelationshipService;
import com.kasumio.evidence.Evidence;
import com.kasumio.evidence.EvidenceRepository;
import com.kasumio.evidence.VerificationRepository;
import com.kasumio.opportunity.CandidateAliasService;
import com.kasumio.opportunity.EvidenceLevel;
import com.kasumio.opportunity.Opportunity;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Autonomous Candidate Discovery Service
 * 
 * Inspects candidate evidence, analyzes capabilities, scores readiness deterministically,
 * and produces explainable recommendations for the recruiter agent.
 */
@Service
public class AutonomousCandidateDiscoveryService {

    private final StudentRepository studentRepository;
    private final EvidenceRepository evidenceRepository;
    private final VerificationRepository verificationRepository;
    private final CandidateAliasService candidateAliasService;
    private final EvidenceCapabilityAnalyzer capabilityAnalyzer;
    private final TechnologyRelationshipService relationshipService;
    private final TechnologyNormalizationService normalizationService;
    private final SkillRepository skillRepository;
    private final PersonalizedOutreachDrafter outreachDrafter;
    private final TrustedConnectionRepository trustedConnectionRepository;
    private final AssessmentAttemptRepository attemptRepository;

    public AutonomousCandidateDiscoveryService(
            StudentRepository studentRepository,
            EvidenceRepository evidenceRepository,
            VerificationRepository verificationRepository,
            CandidateAliasService candidateAliasService,
            EvidenceCapabilityAnalyzer capabilityAnalyzer,
            TechnologyRelationshipService relationshipService,
            TechnologyNormalizationService normalizationService,
            SkillRepository skillRepository,
            PersonalizedOutreachDrafter outreachDrafter,
            TrustedConnectionRepository trustedConnectionRepository,
            AssessmentAttemptRepository attemptRepository) {
        this.studentRepository = studentRepository;
        this.evidenceRepository = evidenceRepository;
        this.verificationRepository = verificationRepository;
        this.candidateAliasService = candidateAliasService;
        this.capabilityAnalyzer = capabilityAnalyzer;
        this.relationshipService = relationshipService;
        this.normalizationService = normalizationService;
        this.skillRepository = skillRepository;
        this.outreachDrafter = outreachDrafter;
        this.trustedConnectionRepository = trustedConnectionRepository;
        this.attemptRepository = attemptRepository;
    }

    public static class DiscoveryResult {
        private final int totalScanned;
        private final int totalMatched;
        private final List<DiscoveredCandidateInternal> candidates;

        public DiscoveryResult(int totalScanned, int totalMatched, List<DiscoveredCandidateInternal> candidates) {
            this.totalScanned = totalScanned;
            this.totalMatched = totalMatched;
            this.candidates = candidates;
        }

        public int getTotalScanned() { return totalScanned; }
        public int getTotalMatched() { return totalMatched; }
        public List<DiscoveredCandidateInternal> getCandidates() { return candidates; }
    }

    public static class DiscoveredCandidateInternal {
        private final Student student;
        private final String candidateAlias;
        private final int overallScore;
        private final int readinessScore;
        private final int evidenceStrengthScore;
        private final List<String> observedProjects;
        private final List<String> verifiedEvidence;
        private final List<String> inferredCapabilities;
        private final List<String> missingGaps;
        private final String whyRecommended;
        private final String personalizedMessage;
        private final String assessmentStatus;
        private final Integer assessmentScore;
        private final Integer assessmentMaxScore;

        public DiscoveredCandidateInternal(Student student, String candidateAlias, int overallScore,
                                           int readinessScore, int evidenceStrengthScore,
                                           List<String> observedProjects, List<String> verifiedEvidence,
                                           List<String> inferredCapabilities, List<String> missingGaps,
                                           String whyRecommended, String personalizedMessage,
                                           String assessmentStatus, Integer assessmentScore, Integer assessmentMaxScore) {
            this.student = student;
            this.candidateAlias = candidateAlias;
            this.overallScore = overallScore;
            this.readinessScore = readinessScore;
            this.evidenceStrengthScore = evidenceStrengthScore;
            this.observedProjects = observedProjects;
            this.verifiedEvidence = verifiedEvidence;
            this.inferredCapabilities = inferredCapabilities;
            this.missingGaps = missingGaps;
            this.whyRecommended = whyRecommended;
            this.personalizedMessage = personalizedMessage;
            this.assessmentStatus = assessmentStatus != null ? assessmentStatus : "ELIGIBLE";
            this.assessmentScore = assessmentScore;
            this.assessmentMaxScore = assessmentMaxScore;
        }

        public Student getStudent() { return student; }
        public String getCandidateAlias() { return candidateAlias; }
        public int getOverallScore() { return overallScore; }
        public int getReadinessScore() { return readinessScore; }
        public int getEvidenceStrengthScore() { return evidenceStrengthScore; }
        public List<String> getObservedProjects() { return observedProjects; }
        public List<String> getVerifiedEvidence() { return verifiedEvidence; }
        public List<String> getInferredCapabilities() { return inferredCapabilities; }
        public List<String> getMissingGaps() { return missingGaps; }
        public String getWhyRecommended() { return whyRecommended; }
        public String getPersonalizedMessage() { return personalizedMessage; }
        public String getAssessmentStatus() { return assessmentStatus; }
        public Integer getAssessmentScore() { return assessmentScore; }
        public Integer getAssessmentMaxScore() { return assessmentMaxScore; }

        public CandidateRecommendationDto toDto() {
            CandidateRecommendationDto dto = new CandidateRecommendationDto(
                    null,
                    candidateAlias,
                    overallScore,
                    readinessScore,
                    evidenceStrengthScore,
                    observedProjects,
                    verifiedEvidence,
                    inferredCapabilities,
                    missingGaps,
                    whyRecommended,
                    personalizedMessage,
                    ApprovalStatus.APPROVED,
                    OutreachStatus.PENDING
            );
            dto.setStudentId(student.getId());
            dto.setAssessmentStatus(assessmentStatus);
            dto.setAssessmentScore(assessmentScore);
            dto.setAssessmentMaxScore(assessmentMaxScore);
            return dto;
        }
    }

    @Transactional
    public DiscoveryResult discoverCandidates(ParsedIntentDto intent, int minReadiness, int maxCandidates, String companyName, Opportunity existingOpportunity) {
        List<Student> allStudents = studentRepository.findAll();
        int totalScanned = allStudents.size();

        // Resolve required and preferred skills
        List<Skill> reqSkills = resolveSkillList(intent.getRequiredSkills());
        List<Skill> prefSkills = resolveSkillList(intent.getPreferredSkills());

        List<DiscoveredCandidateInternal> scoredCandidates = new ArrayList<>();

        for (Student student : allStudents) {
            List<Evidence> evidenceList = evidenceRepository.findByStudentOrderByCreatedAtDesc(student);
            Map<Long, EvidenceCapabilityAnalyzer.TechnologyCapability> caps = capabilityAnalyzer.analyzeStudentCapabilities(student);

            // If existing opportunity, check if student already has an active connection request or connection
            if (existingOpportunity != null && trustedConnectionRepository.findByOpportunityAndStudent(existingOpportunity, student).isPresent()) {
                continue; // Skip candidates who already have an existing connection/outreach record
            }

            List<String> observedProjects = new ArrayList<>();
            List<String> verifiedItems = new ArrayList<>();
            List<String> inferredList = new ArrayList<>();
            List<String> missingList = new ArrayList<>();
            List<String> matchedTechNames = new ArrayList<>();

            double requiredTotal = reqSkills.size();
            double requiredMatched = 0.0;
            double preferredTotal = prefSkills.size();
            double preferredMatched = 0.0;
            double totalConfidence = 0.0;
            int totalEvaluated = 0;

            // Evaluate required skills
            for (Skill skill : reqSkills) {
                EvidenceCapabilityAnalyzer.TechnologyCapability cap = capabilityAnalyzer.evaluateTargetSkill(skill, caps);
                totalConfidence += cap.getConfidenceScore();
                totalEvaluated++;

                if (cap.getEvidenceLevel() == EvidenceLevel.VERIFIED || cap.getEvidenceLevel() == EvidenceLevel.STRONG || cap.getEvidenceLevel() == EvidenceLevel.STRONG_EVIDENCE) {
                    requiredMatched += 1.0;
                    matchedTechNames.add(skill.getName());
                    if (cap.isVerified()) {
                        verifiedItems.add(skill.getName());
                    }
                } else if (cap.getEvidenceLevel() == EvidenceLevel.MODERATE || cap.getEvidenceLevel() == EvidenceLevel.LIMITED_EVIDENCE) {
                    requiredMatched += 0.6;
                    matchedTechNames.add(skill.getName());
                } else if (cap.getEvidenceLevel() == EvidenceLevel.INFERRED) {
                    requiredMatched += 0.3;
                    inferredList.add(skill.getName());
                } else {
                    missingList.add(skill.getName());
                }
            }

            // Evaluate preferred skills
            for (Skill skill : prefSkills) {
                EvidenceCapabilityAnalyzer.TechnologyCapability cap = capabilityAnalyzer.evaluateTargetSkill(skill, caps);
                totalConfidence += cap.getConfidenceScore();
                totalEvaluated++;

                if (cap.getEvidenceLevel() == EvidenceLevel.VERIFIED || cap.getEvidenceLevel() == EvidenceLevel.STRONG || cap.getEvidenceLevel() == EvidenceLevel.STRONG_EVIDENCE) {
                    preferredMatched += 1.0;
                    matchedTechNames.add(skill.getName());
                    if (cap.isVerified()) {
                        verifiedItems.add(skill.getName());
                    }
                } else if (cap.getEvidenceLevel() == EvidenceLevel.MODERATE || cap.getEvidenceLevel() == EvidenceLevel.LIMITED_EVIDENCE) {
                    preferredMatched += 0.6;
                    matchedTechNames.add(skill.getName());
                } else if (cap.getEvidenceLevel() == EvidenceLevel.INFERRED) {
                    preferredMatched += 0.3;
                    inferredList.add(skill.getName());
                }
            }

            // Collect direct observed project titles
            for (Evidence ev : evidenceList) {
                boolean matchesOpp = reqSkills.stream().anyMatch(s -> s.getId().equals(ev.getSkill().getId())) ||
                                     prefSkills.stream().anyMatch(s -> s.getId().equals(ev.getSkill().getId()));
                if (matchesOpp) {
                    observedProjects.add(ev.getTitle() + " (" + ev.getSkill().getName() + ")");
                }
            }

            double reqRatio = requiredTotal > 0 ? (requiredMatched / requiredTotal) : 1.0;
            double prefRatio = preferredTotal > 0 ? (preferredMatched / preferredTotal) : 1.0;
            double avgConfidence = totalEvaluated > 0 ? (totalConfidence / totalEvaluated) : 0.0;

            // Score math: Required coverage (50%) + Evidence strength (30%) + Preferred coverage (20%)
            int overallScore = (int) Math.round((reqRatio * 50.0) + (avgConfidence * 30.0) + (prefRatio * 20.0));
            overallScore = Math.max(0, Math.min(100, overallScore));

            int readinessScore = (int) Math.round((reqRatio * 60.0) + (avgConfidence * 40.0));
            readinessScore = Math.max(0, Math.min(100, readinessScore));

            int evidenceStrengthScore = (int) Math.round(avgConfidence * 100.0);

            // Check for completed Round-1 Technical Screening attempt
            String assessmentStatus = "ELIGIBLE";
            Integer assessmentScore = null;
            Integer assessmentMaxScore = null;

            if (existingOpportunity != null) {
                List<AssessmentAttempt> attempts = attemptRepository.findByOpportunityIdAndStudentId(existingOpportunity.getId(), student.getId());
                if (!attempts.isEmpty()) {
                    AssessmentAttempt latest = attempts.get(0);
                    if (latest.getStatus() == AttemptStatus.COMPLETED) {
                        assessmentStatus = "COMPLETED";
                        assessmentScore = latest.getScore();
                        assessmentMaxScore = latest.getMaxScore();
                    } else if (latest.getStatus() == AttemptStatus.IN_PROGRESS) {
                        assessmentStatus = "IN_PROGRESS";
                    }
                }
            }

            // Filter: Candidate must have at least 1 demonstrated skill or match minimum readiness
            boolean hasDemonstratedAny = !matchedTechNames.isEmpty() || !observedProjects.isEmpty() || "COMPLETED".equals(assessmentStatus);
            if (hasDemonstratedAny && readinessScore >= minReadiness) {
                String alias = candidateAliasService.getOrCreateAlias(student);
                String whyRecommended = buildWhyRecommended(matchedTechNames, verifiedItems, observedProjects, inferredList, missingList, readinessScore);
                if ("COMPLETED".equals(assessmentStatus) && assessmentScore != null) {
                    whyRecommended = "Passed Round-1 Technical Screening (" + assessmentScore + "/" + assessmentMaxScore + " pts). " + whyRecommended;
                }
                String personalizedMessage = outreachDrafter.draftMessage(intent, observedProjects, verifiedItems, matchedTechNames, companyName);

                scoredCandidates.add(new DiscoveredCandidateInternal(
                        student,
                        alias,
                        overallScore,
                        readinessScore,
                        evidenceStrengthScore,
                        observedProjects,
                        verifiedItems,
                        inferredList,
                        missingList,
                        whyRecommended,
                        personalizedMessage,
                        assessmentStatus,
                        assessmentScore,
                        assessmentMaxScore
                ));
            }
        }

        int totalMatched = scoredCandidates.size();

        // Sort candidates: overallScore descending, then readinessScore descending
        scoredCandidates.sort((a, b) -> {
            if (b.getOverallScore() != a.getOverallScore()) {
                return Integer.compare(b.getOverallScore(), a.getOverallScore());
            }
            return Integer.compare(b.getReadinessScore(), a.getReadinessScore());
        });

        // Limit to maxCandidates
        if (scoredCandidates.size() > maxCandidates) {
            scoredCandidates = scoredCandidates.subList(0, maxCandidates);
        }

        return new DiscoveryResult(totalScanned, totalMatched, scoredCandidates);
    }

    private List<Skill> resolveSkillList(List<String> skillNames) {
        List<Skill> list = new ArrayList<>();
        if (skillNames == null) return list;
        for (String name : skillNames) {
            Optional<Skill> res = normalizationService.resolve(name);
            res.ifPresent(list::add);
        }
        return list;
    }

    private String buildWhyRecommended(List<String> matched, List<String> verified,
                                       List<String> observed, List<String> inferred,
                                       List<String> missing, int readinessScore) {
        StringBuilder sb = new StringBuilder();

        if (!verified.isEmpty()) {
            sb.append("Verified evidence exists for ").append(String.join(", ", verified)).append(". ");
        } else if (!matched.isEmpty()) {
            sb.append("Demonstrated evidence aligns with ").append(String.join(", ", matched)).append(". ");
        }

        if (!observed.isEmpty()) {
            sb.append(observed.size()).append(" direct code/project artifact(s) submitted. ");
        }

        if (!inferred.isEmpty()) {
            sb.append("Capabilities in ").append(String.join(", ", inferred)).append(" inferred from related ecosystem experience. ");
        }

        if (!missing.isEmpty()) {
            sb.append("Note: No evidence currently observed for ").append(String.join(", ", missing)).append(". ");
        }

        sb.append("Calculated Day-1 readiness: ").append(readinessScore).append("/100.");
        return sb.toString();
    }
}
