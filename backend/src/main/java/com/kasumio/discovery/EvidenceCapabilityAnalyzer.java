package com.kasumio.discovery;

import com.kasumio.evidence.Evidence;
import com.kasumio.evidence.EvidenceRepository;
import com.kasumio.evidence.EvidenceType;
import com.kasumio.evidence.VerificationRepository;
import com.kasumio.opportunity.EvidenceLevel;
import com.kasumio.skill.Skill;
import com.kasumio.student.Student;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Evidence Capability Analyzer
 * 
 * Evaluates candidate technology capabilities strictly from factual database evidence.
 * Produces 100% reproducible, explainable confidence metrics without fabricating skills.
 */
@Service
public class EvidenceCapabilityAnalyzer {

    private final EvidenceRepository evidenceRepository;
    private final VerificationRepository verificationRepository;
    private final TechnologyRelationshipService relationshipService;

    public EvidenceCapabilityAnalyzer(
            EvidenceRepository evidenceRepository,
            VerificationRepository verificationRepository,
            TechnologyRelationshipService relationshipService) {
        this.evidenceRepository = evidenceRepository;
        this.verificationRepository = verificationRepository;
        this.relationshipService = relationshipService;
    }

    public static class TechnologyCapability {
        private final Skill skill;
        private final EvidenceLevel evidenceLevel;
        private final double confidenceScore; // 0.0 to 1.0
        private final int evidenceCount;
        private final boolean isVerified;
        private final boolean isRecent;
        private final String explanation;

        public TechnologyCapability(Skill skill, EvidenceLevel evidenceLevel, double confidenceScore, 
                                    int evidenceCount, boolean isVerified, boolean isRecent, String explanation) {
            this.skill = skill;
            this.evidenceLevel = evidenceLevel;
            this.confidenceScore = confidenceScore;
            this.evidenceCount = evidenceCount;
            this.isVerified = isVerified;
            this.isRecent = isRecent;
            this.explanation = explanation;
        }

        public Skill getSkill() { return skill; }
        public EvidenceLevel getEvidenceLevel() { return evidenceLevel; }
        public double getConfidenceScore() { return confidenceScore; }
        public int getEvidenceCount() { return evidenceCount; }
        public boolean isVerified() { return isVerified; }
        public boolean isRecent() { return isRecent; }
        public String getExplanation() { return explanation; }
    }

    /**
     * Analyze all technology capabilities for a student based on existing evidence.
     */
    @Transactional(readOnly = true)
    public Map<Long, TechnologyCapability> analyzeStudentCapabilities(Student student) {
        List<Evidence> evidenceList = evidenceRepository.findByStudentOrderByCreatedAtDesc(student);
        Map<Long, List<Evidence>> evidenceBySkillId = evidenceList.stream()
                .collect(Collectors.groupingBy(e -> e.getSkill().getId()));

        Map<Long, TechnologyCapability> capabilities = new HashMap<>();

        for (Map.Entry<Long, List<Evidence>> entry : evidenceBySkillId.entrySet()) {
            List<Evidence> list = entry.getValue();
            Skill skill = list.get(0).getSkill();
            TechnologyCapability cap = evaluateDirectEvidence(skill, list);
            capabilities.put(skill.getId(), cap);
        }

        return capabilities;
    }

    /**
     * Evaluate capability for a target skill against student's possessed capabilities.
     * If direct evidence exists, return direct evaluation.
     * If no direct evidence, check for related technology inference.
     */
    @Transactional(readOnly = true)
    public TechnologyCapability evaluateTargetSkill(Skill targetSkill, Map<Long, TechnologyCapability> studentCapabilities) {
        if (studentCapabilities.containsKey(targetSkill.getId())) {
            return studentCapabilities.get(targetSkill.getId());
        }

        // Check relationship inference
        Set<Skill> possessedSkills = studentCapabilities.values().stream()
                .filter(c -> c.getEvidenceLevel() != EvidenceLevel.NO_EVIDENCE && c.getEvidenceLevel() != EvidenceLevel.INSUFFICIENT_EVIDENCE)
                .map(TechnologyCapability::getSkill)
                .collect(Collectors.toSet());

        double affinity = relationshipService.getAffinityScore(targetSkill, possessedSkills);
        if (affinity >= 0.3) {
            return new TechnologyCapability(
                    targetSkill,
                    EvidenceLevel.INFERRED,
                    affinity * 0.6, // Inferred capability capped at max 0.6 confidence
                    0,
                    false,
                    false,
                    "Inferred from related evidence in " + (targetSkill.getEcosystem() != null ? targetSkill.getEcosystem() : "ecosystem")
            );
        }

        return new TechnologyCapability(
                targetSkill,
                EvidenceLevel.INSUFFICIENT_EVIDENCE,
                0.0,
                0,
                false,
                false,
                "No demonstrable evidence present"
        );
    }

    private TechnologyCapability evaluateDirectEvidence(Skill skill, List<Evidence> evList) {
        if (evList == null || evList.isEmpty()) {
            return new TechnologyCapability(skill, EvidenceLevel.NO_EVIDENCE, 0.0, 0, false, false, "No evidence submitted");
        }

        boolean verified = evList.stream().anyMatch(e -> verificationRepository.existsByEvidenceId(e.getId()));
        Instant sixMonthsAgo = Instant.now().minus(180, ChronoUnit.DAYS);
        boolean recent = evList.stream().anyMatch(e -> e.getCreatedAt().isAfter(sixMonthsAgo));
        int count = evList.size();

        boolean hasProject = evList.stream().anyMatch(e -> e.getEvidenceType() == EvidenceType.PROJECT);
        boolean hasCert = evList.stream().anyMatch(e -> e.getEvidenceType() == EvidenceType.CERTIFICATE);

        EvidenceLevel level;
        double confidence;
        StringBuilder explanation = new StringBuilder();

        if (verified) {
            level = EvidenceLevel.VERIFIED;
            confidence = Math.min(1.0, 0.85 + (count * 0.05));
            explanation.append("Verified by accredited partner organization.");
        } else if (count >= 2 || (hasProject && recent)) {
            level = EvidenceLevel.STRONG_EVIDENCE;
            confidence = Math.min(0.90, 0.70 + (count * 0.08) + (recent ? 0.05 : 0));
            explanation.append("Strong demonstrable evidence with ").append(count).append(" artifact(s).");
        } else if (count == 1 && (hasProject || hasCert)) {
            level = EvidenceLevel.MODERATE_EVIDENCE;
            confidence = recent ? 0.60 : 0.50;
            explanation.append("Moderate evidence: 1 demonstrated ").append(evList.get(0).getEvidenceType().name().toLowerCase()).append(".");
        } else {
            level = EvidenceLevel.WEAK_EVIDENCE;
            confidence = 0.35;
            explanation.append("Limited evidence submitted.");
        }

        return new TechnologyCapability(skill, level, confidence, count, verified, recent, explanation.toString());
    }
}
