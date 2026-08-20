package com.kasumio.discovery;

import com.kasumio.goal.CareerGoal;
import com.kasumio.goal.CareerGoalRepository;
import com.kasumio.opportunity.EvidenceLevel;
import com.kasumio.opportunity.Opportunity;
import com.kasumio.opportunity.ReadinessState;
import com.kasumio.opportunity.SkillRequirementType;
import com.kasumio.opportunity.WorkType;
import com.kasumio.skill.Skill;
import com.kasumio.student.Student;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Deterministic Match Scorer & Readiness Engine
 * 
 * 100% reproducible, explainable scoring engine.
 * Given the same Student, Evidence, Opportunity, and Config, produces the exact same score and explanation.
 * Computes:
 * - Match Score (0-100)
 * - Readiness Score (0-100)
 * - Evidence Strength Score (0-100)
 * - Opportunity Distance (Gap count + explanation)
 * - Eligibility Assessment
 */
@Service
public class DeterministicMatchScorer {

    private final OpportunityRequirementExtractor requirementExtractor;
    private final EvidenceCapabilityAnalyzer capabilityAnalyzer;
    private final CareerGoalRepository careerGoalRepository;

    public DeterministicMatchScorer(
            OpportunityRequirementExtractor requirementExtractor,
            EvidenceCapabilityAnalyzer capabilityAnalyzer,
            CareerGoalRepository careerGoalRepository) {
        this.requirementExtractor = requirementExtractor;
        this.capabilityAnalyzer = capabilityAnalyzer;
        this.careerGoalRepository = careerGoalRepository;
    }

    public static class TechnologyMatchDetail {
        private final Skill skill;
        private final SkillRequirementType requirementType;
        private final EvidenceLevel evidenceLevel;
        private final double scoreContribution;
        private final String status; // MATCHED, PARTIAL, MISSING
        private final String explanation;

        public TechnologyMatchDetail(Skill skill, SkillRequirementType requirementType, EvidenceLevel evidenceLevel,
                                     double scoreContribution, String status, String explanation) {
            this.skill = skill;
            this.requirementType = requirementType;
            this.evidenceLevel = evidenceLevel;
            this.scoreContribution = scoreContribution;
            this.status = status;
            this.explanation = explanation;
        }

        public Skill getSkill() { return skill; }
        public SkillRequirementType getRequirementType() { return requirementType; }
        public EvidenceLevel getEvidenceLevel() { return evidenceLevel; }
        public double getScoreContribution() { return scoreContribution; }
        public String getStatus() { return status; }
        public String getExplanation() { return explanation; }
    }

    public static class MatchResult {
        private final int overallScore; // 0 to 100
        private final int readinessScore; // 0 to 100
        private final int evidenceStrengthScore; // 0 to 100
        private final String matchCategory; // Strong Match, Potential Match, Stretch Opportunity, Not Eligible
        private final boolean isEligible;
        private final String eligibilityReason;
        private final int opportunityDistance; // Count of major capability gaps
        private final String opportunityDistanceExplanation;
        private final List<TechnologyMatchDetail> matchedSkills;
        private final List<TechnologyMatchDetail> partialSkills;
        private final List<TechnologyMatchDetail> missingSkills;
        private final String whyRecommended;
        private final String whyNotRecommended;
        private final String careerAlignmentNote;
        private final String deadlineNote;
        private final double requiredCoverage;
        private final double preferredCoverage;
        private final ReadinessState readinessState;

        public MatchResult(int overallScore, int readinessScore, int evidenceStrengthScore,
                           String matchCategory, boolean isEligible, String eligibilityReason,
                           int opportunityDistance, String opportunityDistanceExplanation,
                           List<TechnologyMatchDetail> matchedSkills, List<TechnologyMatchDetail> partialSkills,
                           List<TechnologyMatchDetail> missingSkills, String whyRecommended,
                           String whyNotRecommended, String careerAlignmentNote, String deadlineNote,
                           double requiredCoverage, double preferredCoverage, ReadinessState readinessState) {
            this.overallScore = overallScore;
            this.readinessScore = readinessScore;
            this.evidenceStrengthScore = evidenceStrengthScore;
            this.matchCategory = matchCategory;
            this.isEligible = isEligible;
            this.eligibilityReason = eligibilityReason;
            this.opportunityDistance = opportunityDistance;
            this.opportunityDistanceExplanation = opportunityDistanceExplanation;
            this.matchedSkills = matchedSkills;
            this.partialSkills = partialSkills;
            this.missingSkills = missingSkills;
            this.whyRecommended = whyRecommended;
            this.whyNotRecommended = whyNotRecommended;
            this.careerAlignmentNote = careerAlignmentNote;
            this.deadlineNote = deadlineNote;
            this.requiredCoverage = requiredCoverage;
            this.preferredCoverage = preferredCoverage;
            this.readinessState = readinessState;
        }

        public int getOverallScore() { return overallScore; }
        public int getReadinessScore() { return readinessScore; }
        public int getEvidenceStrengthScore() { return evidenceStrengthScore; }
        public String getMatchCategory() { return matchCategory; }
        public boolean isEligible() { return isEligible; }
        public String getEligibilityReason() { return eligibilityReason; }
        public int getOpportunityDistance() { return opportunityDistance; }
        public String getOpportunityDistanceExplanation() { return opportunityDistanceExplanation; }
        public List<TechnologyMatchDetail> getMatchedSkills() { return matchedSkills; }
        public List<TechnologyMatchDetail> getPartialSkills() { return partialSkills; }
        public List<TechnologyMatchDetail> getMissingSkills() { return missingSkills; }
        public String getWhyRecommended() { return whyRecommended; }
        public String getWhyNotRecommended() { return whyNotRecommended; }
        public String getCareerAlignmentNote() { return careerAlignmentNote; }
        public String getDeadlineNote() { return deadlineNote; }
        public double getRequiredCoverage() { return requiredCoverage; }
        public double getPreferredCoverage() { return preferredCoverage; }
        public ReadinessState getReadinessState() { return readinessState; }
    }

    /**
     * Compute deterministic match score for a student and opportunity.
     */
    @Transactional(readOnly = true)
    public MatchResult calculateMatch(Student student, Opportunity opportunity) {
        OpportunityRequirementExtractor.ExtractedOpportunityProfile profile = requirementExtractor.extract(opportunity);
        Map<Long, EvidenceCapabilityAnalyzer.TechnologyCapability> studentCaps = capabilityAnalyzer.analyzeStudentCapabilities(student);

        List<TechnologyMatchDetail> matched = new ArrayList<>();
        List<TechnologyMatchDetail> partial = new ArrayList<>();
        List<TechnologyMatchDetail> missing = new ArrayList<>();

        double requiredTotal = 0;
        double requiredMatched = 0;

        double preferredTotal = 0;
        double preferredMatched = 0;

        double totalConfidenceSum = 0;
        int evaluatedCount = 0;
        int missingRequiredCount = 0;

        for (OpportunityRequirementExtractor.ExtractedRequirement req : profile.getRequirements()) {
            Skill skill = req.getSkill();
            EvidenceCapabilityAnalyzer.TechnologyCapability cap = capabilityAnalyzer.evaluateTargetSkill(skill, studentCaps);

            boolean isReq = req.getRequirementType() == SkillRequirementType.REQUIRED;
            if (isReq) requiredTotal++;
            else preferredTotal++;

            double confidence = cap.getConfidenceScore();
            totalConfidenceSum += confidence;
            evaluatedCount++;

            if (cap.getEvidenceLevel() == EvidenceLevel.VERIFIED || cap.getEvidenceLevel() == EvidenceLevel.STRONG || cap.getEvidenceLevel() == EvidenceLevel.STRONG_EVIDENCE) {
                if (isReq) requiredMatched += 1.0;
                else preferredMatched += 1.0;
                matched.add(new TechnologyMatchDetail(skill, req.getRequirementType(), cap.getEvidenceLevel(), 1.0, "MATCHED", cap.getExplanation()));
            } else if (cap.getEvidenceLevel() == EvidenceLevel.MODERATE || cap.getEvidenceLevel() == EvidenceLevel.INFERRED || cap.getEvidenceLevel() == EvidenceLevel.LIMITED_EVIDENCE) {
                double partialCredit = cap.getEvidenceLevel() == EvidenceLevel.MODERATE ? 0.7 : 0.4;
                if (isReq) requiredMatched += partialCredit;
                else preferredMatched += partialCredit;
                partial.add(new TechnologyMatchDetail(skill, req.getRequirementType(), cap.getEvidenceLevel(), partialCredit, "PARTIAL", cap.getExplanation()));
                if (isReq) missingRequiredCount++;
            } else {
                missing.add(new TechnologyMatchDetail(skill, req.getRequirementType(), cap.getEvidenceLevel(), 0.0, "MISSING", "Missing demonstrable evidence"));
                if (isReq) missingRequiredCount++;
            }
        }

        // Component 1: Required Skills Coverage (40%)
        double reqRatio = requiredTotal > 0 ? (requiredMatched / requiredTotal) : (preferredTotal > 0 ? (preferredMatched / preferredTotal) : 1.0);
        double reqScore = Math.min(1.0, reqRatio) * 40.0;

        // Component 2: Preferred Skills Coverage (15%)
        double prefRatio = preferredTotal > 0 ? (preferredMatched / preferredTotal) : 1.0;
        double prefScore = Math.min(1.0, prefRatio) * 15.0;

        // Component 3: Evidence Confidence (15%)
        double avgConfidence = evaluatedCount > 0 ? (totalConfidenceSum / evaluatedCount) : 0.0;
        double confidenceScore = avgConfidence * 15.0;

        // Component 4: Eligibility Check (10%)
        boolean isEligible = true;
        String eligibilityReason = "Candidate meets all baseline criteria";
        double eligibilityScore = 10.0;

        if (opportunity.isExpired()) {
            isEligible = false;
            eligibilityReason = "Opportunity deadline has passed";
            eligibilityScore = 0.0;
        }

        // Component 5: Career Goal Alignment (10%)
        double careerScore = 0.0;
        String careerAlignmentNote = "No specific career goal match";
        List<CareerGoal> goals = careerGoalRepository.findByStudentOrderByTitleAsc(student);
        for (CareerGoal goal : goals) {
            String target = goal.getTargetRole().toLowerCase();
            String title = opportunity.getTitle().toLowerCase();
            if (title.contains(target) || target.contains(title)) {
                careerScore = 10.0;
                careerAlignmentNote = "Direct alignment with your defined goal: " + goal.getTargetRole();
                break;
            } else if (goal.getDescription() != null && goal.getDescription().toLowerCase().contains(opportunity.getType().name().toLowerCase())) {
                careerScore = 5.0;
                careerAlignmentNote = "Aligns with career focus areas";
            }
        }

        // Component 6: Location & Work Mode Compatibility (5%)
        double workModeScore = 5.0; // Default full credit for Remote or matched
        if (opportunity.getWorkType() == WorkType.ON_SITE && opportunity.getLocation() != null && student.getUniversity() != null) {
            if (!opportunity.getLocation().toLowerCase().contains(student.getUniversity().toLowerCase())) {
                workModeScore = 3.0; // Minor deduction for on-site relocation
            }
        }

        // Component 7: Deadline Relevance (5%)
        double deadlineScore = 5.0;
        String deadlineNote = "Active opportunity";
        if (opportunity.getDeadline() != null) {
            long daysUntilDeadline = ChronoUnit.DAYS.between(Instant.now(), opportunity.getDeadline());
            if (daysUntilDeadline < 0) {
                deadlineScore = 0.0;
                deadlineNote = "Expired";
            } else if (daysUntilDeadline <= 3) {
                deadlineScore = 5.0;
                deadlineNote = "Closing within 3 days — High priority";
            } else if (daysUntilDeadline <= 7) {
                deadlineScore = 4.5;
                deadlineNote = "Closing this week";
            }
        }

        int finalScore = (int) Math.round(reqScore + prefScore + confidenceScore + eligibilityScore + careerScore + workModeScore + deadlineScore);
        finalScore = Math.max(0, Math.min(100, finalScore));

        if (!isEligible) {
            finalScore = Math.min(finalScore, 25); // Cap ineligible scores
        }

        // Dedicated Readiness Score: Focuses strictly on Day-1 execution competence (Required coverage 60% + Evidence strength 40%)
        double rawReadiness = (reqRatio * 60.0) + (avgConfidence * 40.0);
        int readinessScore = (int) Math.round(Math.max(0, Math.min(100, isEligible ? rawReadiness : rawReadiness * 0.2)));

        // Dedicated Evidence Strength Score: 0 to 100 based on verified and strong artifacts
        int evidenceStrengthScore = (int) Math.round(avgConfidence * 100.0);

        // Opportunity Distance: Count of missing/partial required capability gaps
        int opportunityDistance = missingRequiredCount;
        String distanceExplanation = buildDistanceExplanation(missingRequiredCount, missing, partial);

        // Deterministic ReadinessState calculation
        ReadinessState readinessState;
        if (!isEligible) {
            readinessState = ReadinessState.NOT_ELIGIBLE;
        } else if (studentCaps.isEmpty()) {
            readinessState = ReadinessState.INSUFFICIENT_EVIDENCE;
        } else if (reqRatio >= 0.75 && avgConfidence >= 0.5) {
            readinessState = ReadinessState.READY;
        } else if (reqRatio >= 0.4) {
            readinessState = ReadinessState.ALMOST_READY;
        } else {
            readinessState = ReadinessState.STRETCH;
        }

        // Match Category
        String matchCategory;
        if (!isEligible) {
            matchCategory = "Not Eligible";
        } else if (readinessState == ReadinessState.READY || finalScore >= 75) {
            matchCategory = "Strong Match";
        } else if (readinessState == ReadinessState.ALMOST_READY || finalScore >= 50) {
            matchCategory = "Potential Match";
        } else {
            matchCategory = "Stretch Opportunity";
        }

        // Explainable Why Recommended
        String whyRecommended = buildExplanation(matched, partial, missing, careerAlignmentNote, finalScore);

        // Constructive Why Not Recommended for weaker matches
        String whyNotRecommended = buildWhyNotExplanation(readinessState, isEligible, eligibilityReason, missing);

        return new MatchResult(
                finalScore,
                readinessScore,
                evidenceStrengthScore,
                matchCategory,
                isEligible,
                eligibilityReason,
                opportunityDistance,
                distanceExplanation,
                matched,
                partial,
                missing,
                whyRecommended,
                whyNotRecommended,
                careerAlignmentNote,
                deadlineNote,
                reqRatio,
                prefRatio,
                readinessState
        );
    }

    private String buildWhyNotExplanation(ReadinessState state, boolean isEligible, String eligibilityReason, List<TechnologyMatchDetail> missing) {
        if (!isEligible) {
            return "This opportunity is currently unavailable because: " + eligibilityReason + ".";
        }
        if (state == ReadinessState.INSUFFICIENT_EVIDENCE) {
            return "Not enough demonstrable evidence submitted yet to make a confident readiness recommendation.";
        }
        if (state == ReadinessState.STRETCH) {
            List<String> missingReqs = missing.stream()
                    .filter(m -> m.getRequirementType() == SkillRequirementType.REQUIRED)
                    .map(m -> m.getSkill().getName())
                    .limit(3)
                    .toList();
            if (!missingReqs.isEmpty()) {
                return "This opportunity isn't one of your strongest matches right now because key requirements (" + formatList(missingReqs) + ") haven't been demonstrated with evidence yet.";
            }
            return "This opportunity has significant capability gaps compared to your current evidence.";
        }
        if (state == ReadinessState.ALMOST_READY) {
            List<String> missingReqs = missing.stream()
                    .filter(m -> m.getRequirementType() == SkillRequirementType.REQUIRED)
                    .map(m -> m.getSkill().getName())
                    .limit(2)
                    .toList();
            if (!missingReqs.isEmpty()) {
                return "You're already close. Demonstrating evidence for " + formatList(missingReqs) + " will transition you to fully ready.";
            }
        }
        return "You have strong alignment with this opportunity.";
    }

    private String buildDistanceExplanation(int gapCount, List<TechnologyMatchDetail> missing, List<TechnologyMatchDetail> partial) {
        if (gapCount == 0) {
            return "Zero capability gaps. Your demonstrable evidence covers all required competencies for this opportunity.";
        }

        List<String> missingReqs = missing.stream()
                .filter(m -> m.getRequirementType() == SkillRequirementType.REQUIRED)
                .map(m -> m.getSkill().getName())
                .toList();

        List<String> partialReqs = partial.stream()
                .filter(p -> p.getRequirementType() == SkillRequirementType.REQUIRED)
                .map(p -> p.getSkill().getName())
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append(gapCount).append(" capability gap").append(gapCount > 1 ? "s" : "").append(" from competitive readiness: ");
        if (!missingReqs.isEmpty()) {
            sb.append("Missing proof for ").append(formatList(missingReqs)).append(". ");
        }
        if (!partialReqs.isEmpty()) {
            sb.append("Partial/emerging proof in ").append(formatList(partialReqs)).append(" needs strengthening.");
        }
        return sb.toString().trim();
    }

    private String buildExplanation(List<TechnologyMatchDetail> matched, List<TechnologyMatchDetail> partial,
                                     List<TechnologyMatchDetail> missing, String careerNote, int score) {
        StringBuilder sb = new StringBuilder();

        if (!matched.isEmpty()) {
            List<String> names = matched.stream().map(m -> m.getSkill().getName()).toList();
            sb.append("Your demonstrable evidence strongly supports ").append(formatList(names)).append(". ");
        }

        if (!partial.isEmpty()) {
            List<String> names = partial.stream().map(m -> m.getSkill().getName()).toList();
            sb.append("You have emerging/related capability in ").append(formatList(names)).append(". ");
        }

        if (!missing.isEmpty()) {
            List<String> names = missing.stream().map(m -> m.getSkill().getName()).limit(3).toList();
            sb.append("Key skill gaps to address include ").append(formatList(names)).append(". ");
        }

        if (careerNote != null && careerNote.startsWith("Direct alignment")) {
            sb.append(careerNote).append(". ");
        }

        return sb.toString().trim();
    }

    private String formatList(List<String> items) {
        if (items == null || items.isEmpty()) return "";
        if (items.size() == 1) return items.get(0);
        if (items.size() == 2) return items.get(0) + " and " + items.get(1);
        return String.join(", ", items.subList(0, items.size() - 1)) + ", and " + items.get(items.size() - 1);
    }
}
