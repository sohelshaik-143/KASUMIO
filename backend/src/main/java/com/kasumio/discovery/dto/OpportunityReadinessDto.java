package com.kasumio.discovery.dto;

import java.util.List;

/**
 * Detailed Opportunity Readiness Payload
 * Contains Match Score, Readiness Index, Evidence Strength, Eligibility, and Opportunity Distance.
 */
public class OpportunityReadinessDto {

    private Long opportunityId;
    private String opportunityTitle;
    private String organizationName;
    private int matchScore; // 0 - 100
    private int readinessScore; // 0 - 100
    private int evidenceStrengthScore; // 0 - 100
    private boolean isEligible;
    private String eligibilityReason;
    private String matchCategory; // Strong Match, Potential Match, Stretch Opportunity, Not Eligible
    private int opportunityDistance; // Count of major gaps
    private String opportunityDistanceExplanation;
    private String whyRecommended;
    private List<TechnologySkillEvaluationDto> skillCoverage;
    private List<PrioritizedGapDto> prioritizedGaps;
    private List<String> recommendedPreparationActions;

    public OpportunityReadinessDto() {}

    public OpportunityReadinessDto(Long opportunityId, String opportunityTitle, String organizationName,
                                   int matchScore, int readinessScore, int evidenceStrengthScore,
                                   boolean isEligible, String eligibilityReason, String matchCategory,
                                   int opportunityDistance, String opportunityDistanceExplanation,
                                   String whyRecommended, List<TechnologySkillEvaluationDto> skillCoverage,
                                   List<PrioritizedGapDto> prioritizedGaps,
                                   List<String> recommendedPreparationActions) {
        this.opportunityId = opportunityId;
        this.opportunityTitle = opportunityTitle;
        this.organizationName = organizationName;
        this.matchScore = matchScore;
        this.readinessScore = readinessScore;
        this.evidenceStrengthScore = evidenceStrengthScore;
        this.isEligible = isEligible;
        this.eligibilityReason = eligibilityReason;
        this.matchCategory = matchCategory;
        this.opportunityDistance = opportunityDistance;
        this.opportunityDistanceExplanation = opportunityDistanceExplanation;
        this.whyRecommended = whyRecommended;
        this.skillCoverage = skillCoverage;
        this.prioritizedGaps = prioritizedGaps;
        this.recommendedPreparationActions = recommendedPreparationActions;
    }

    public Long getOpportunityId() { return opportunityId; }
    public String getOpportunityTitle() { return opportunityTitle; }
    public String getOrganizationName() { return organizationName; }
    public int getMatchScore() { return matchScore; }
    public int getReadinessScore() { return readinessScore; }
    public int getEvidenceStrengthScore() { return evidenceStrengthScore; }
    public boolean isEligible() { return isEligible; }
    public String getEligibilityReason() { return eligibilityReason; }
    public String getMatchCategory() { return matchCategory; }
    public int getOpportunityDistance() { return opportunityDistance; }
    public String getOpportunityDistanceExplanation() { return opportunityDistanceExplanation; }
    public String getWhyRecommended() { return whyRecommended; }
    public List<TechnologySkillEvaluationDto> getSkillCoverage() { return skillCoverage; }
    public List<PrioritizedGapDto> getPrioritizedGaps() { return prioritizedGaps; }
    public List<String> getRecommendedPreparationActions() { return recommendedPreparationActions; }
}
