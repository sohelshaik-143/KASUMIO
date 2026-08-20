package com.kasumio.evidence;

import com.kasumio.opportunity.EvidenceLevel;
import com.kasumio.skill.Skill;
import com.kasumio.student.Student;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class EvidenceIntelligenceService {

    private final VerificationRepository verificationRepository;

    public EvidenceIntelligenceService(VerificationRepository verificationRepository) {
        this.verificationRepository = verificationRepository;
    }

    public static class SkillEvidenceEvaluation {
        private final Skill skill;
        private final EvidenceLevel confidenceLevel;
        private final int evidenceCount;
        private final boolean isVerified;
        private final boolean isRecent;
        private final String reasoning;

        public SkillEvidenceEvaluation(Skill skill, EvidenceLevel confidenceLevel, int evidenceCount,
                                       boolean isVerified, boolean isRecent, String reasoning) {
            this.skill = skill;
            this.confidenceLevel = confidenceLevel;
            this.evidenceCount = evidenceCount;
            this.isVerified = isVerified;
            this.isRecent = isRecent;
            this.reasoning = reasoning;
        }

        public Skill getSkill() {
            return skill;
        }

        public EvidenceLevel getConfidenceLevel() {
            return confidenceLevel;
        }

        public int getEvidenceCount() {
            return evidenceCount;
        }

        public boolean isVerified() {
            return isVerified;
        }

        public boolean isRecent() {
            return isRecent;
        }

        public String getReasoning() {
            return reasoning;
        }

        public boolean isDemonstrated() {
            return confidenceLevel != EvidenceLevel.UNKNOWN && confidenceLevel != EvidenceLevel.NO_EVIDENCE;
        }
    }

    /**
     * Evaluates the evidence strength for a specific skill deterministically.
     */
    public SkillEvidenceEvaluation evaluateSkillEvidence(Skill skill, List<Evidence> evidenceList) {
        if (evidenceList == null || evidenceList.isEmpty()) {
            return new SkillEvidenceEvaluation(
                    skill,
                    EvidenceLevel.UNKNOWN,
                    0,
                    false,
                    false,
                    "No verifiable evidence submitted for " + skill.getName() + "."
            );
        }

        boolean hasVerified = evidenceList.stream()
                .anyMatch(e -> verificationRepository.existsByEvidenceId(e.getId()));

        Instant sixMonthsAgo = Instant.now().minus(180, ChronoUnit.DAYS);
        boolean isRecent = evidenceList.stream()
                .anyMatch(e -> e.getCreatedAt() != null && e.getCreatedAt().isAfter(sixMonthsAgo));

        long projectCount = evidenceList.stream()
                .filter(e -> e.getEvidenceType() == EvidenceType.PROJECT)
                .count();

        long certificateCount = evidenceList.stream()
                .filter(e -> e.getEvidenceType() == EvidenceType.CERTIFICATE)
                .count();

        EvidenceLevel level;
        String reasoning;

        if (hasVerified) {
            level = EvidenceLevel.VERIFIED;
            reasoning = "Verified by platform authority with " + evidenceList.size() + " active evidence item(s).";
        } else if (evidenceList.size() >= 2 || (projectCount >= 1 && certificateCount >= 1)) {
            level = EvidenceLevel.STRONG;
            reasoning = "Strong practical demonstration across " + evidenceList.size() + " evidence item(s).";
        } else if (projectCount == 1 || certificateCount == 1) {
            level = EvidenceLevel.MODERATE;
            reasoning = "Demonstrated with 1 solid project/credential evidence item.";
        } else {
            level = EvidenceLevel.WEAK;
            reasoning = "Preliminary or unverified self-reported artifact.";
        }

        return new SkillEvidenceEvaluation(skill, level, evidenceList.size(), hasVerified, isRecent, reasoning);
    }
}
