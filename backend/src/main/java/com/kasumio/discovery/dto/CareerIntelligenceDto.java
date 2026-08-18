package com.kasumio.discovery.dto;

import java.util.List;
import java.util.Map;

/**
 * Career Intelligence Hub DTO
 * Aggregates market technology demand (Graph 4), opportunity clusters (Graph 7),
 * skill leverage rankings, evidence ROI projects, and portfolio analysis.
 */
public class CareerIntelligenceDto {

    public static class TechnologyDemandMetric {
        private String technologyName;
        private String category;
        private String ecosystem;
        private int opportunityCount;
        private int requiredCount;
        private int preferredCount;
        private boolean studentPossesses;

        public TechnologyDemandMetric() {}

        public TechnologyDemandMetric(String technologyName, String category, String ecosystem,
                                      int opportunityCount, int requiredCount, int preferredCount,
                                      boolean studentPossesses) {
            this.technologyName = technologyName;
            this.category = category;
            this.ecosystem = ecosystem;
            this.opportunityCount = opportunityCount;
            this.requiredCount = requiredCount;
            this.preferredCount = preferredCount;
            this.studentPossesses = studentPossesses;
        }

        public String getTechnologyName() { return technologyName; }
        public String getCategory() { return category; }
        public String getEcosystem() { return ecosystem; }
        public int getOpportunityCount() { return opportunityCount; }
        public int getRequiredCount() { return requiredCount; }
        public int getPreferredCount() { return preferredCount; }
        public boolean isStudentPossesses() { return studentPossesses; }
    }

    public static class OpportunityCluster {
        private String clusterName;
        private String ecosystem;
        private int opportunityCount;
        private double averageMatchScore;
        private List<String> keyTechnologies;
        private List<String> sampleOpportunityTitles;

        public OpportunityCluster() {}

        public OpportunityCluster(String clusterName, String ecosystem, int opportunityCount,
                                  double averageMatchScore, List<String> keyTechnologies,
                                  List<String> sampleOpportunityTitles) {
            this.clusterName = clusterName;
            this.ecosystem = ecosystem;
            this.opportunityCount = opportunityCount;
            this.averageMatchScore = averageMatchScore;
            this.keyTechnologies = keyTechnologies;
            this.sampleOpportunityTitles = sampleOpportunityTitles;
        }

        public String getClusterName() { return clusterName; }
        public String getEcosystem() { return ecosystem; }
        public int getOpportunityCount() { return opportunityCount; }
        public double getAverageMatchScore() { return averageMatchScore; }
        public List<String> getKeyTechnologies() { return keyTechnologies; }
        public List<String> getSampleOpportunityTitles() { return sampleOpportunityTitles; }
    }

    public static class SkillLeverageMetric {
        private Long skillId;
        private String skillName;
        private String category;
        private int opportunitiesUnlockedCount;
        private double potentialScoreIncrease;
        private String rationale;

        public SkillLeverageMetric() {}

        public SkillLeverageMetric(Long skillId, String skillName, String category,
                                   int opportunitiesUnlockedCount, double potentialScoreIncrease,
                                   String rationale) {
            this.skillId = skillId;
            this.skillName = skillName;
            this.category = category;
            this.opportunitiesUnlockedCount = opportunitiesUnlockedCount;
            this.potentialScoreIncrease = potentialScoreIncrease;
            this.rationale = rationale;
        }

        public Long getSkillId() { return skillId; }
        public String getSkillName() { return skillName; }
        public String getCategory() { return category; }
        public int getOpportunitiesUnlockedCount() { return opportunitiesUnlockedCount; }
        public double getPotentialScoreIncrease() { return potentialScoreIncrease; }
        public String getRationale() { return rationale; }
    }

    private int totalOpportunitiesAnalyzed;
    private int studentVerifiedEvidenceCount;
    private List<TechnologyDemandMetric> topDemandedTechnologies;
    private List<OpportunityCluster> opportunityClusters;
    private List<SkillLeverageMetric> highestLeverageSkills;
    private List<EvidenceRoiDto> recommendedRoiProjects;
    private Map<String, Integer> portfolioSavedCategories;
    private String highestLeverageRecommendation;

    public CareerIntelligenceDto() {}

    public CareerIntelligenceDto(int totalOpportunitiesAnalyzed, int studentVerifiedEvidenceCount,
                                 List<TechnologyDemandMetric> topDemandedTechnologies,
                                 List<OpportunityCluster> opportunityClusters,
                                 List<SkillLeverageMetric> highestLeverageSkills,
                                 List<EvidenceRoiDto> recommendedRoiProjects,
                                 Map<String, Integer> portfolioSavedCategories,
                                 String highestLeverageRecommendation) {
        this.totalOpportunitiesAnalyzed = totalOpportunitiesAnalyzed;
        this.studentVerifiedEvidenceCount = studentVerifiedEvidenceCount;
        this.topDemandedTechnologies = topDemandedTechnologies;
        this.opportunityClusters = opportunityClusters;
        this.highestLeverageSkills = highestLeverageSkills;
        this.recommendedRoiProjects = recommendedRoiProjects;
        this.portfolioSavedCategories = portfolioSavedCategories;
        this.highestLeverageRecommendation = highestLeverageRecommendation;
    }

    public int getTotalOpportunitiesAnalyzed() { return totalOpportunitiesAnalyzed; }
    public int getStudentVerifiedEvidenceCount() { return studentVerifiedEvidenceCount; }
    public List<TechnologyDemandMetric> getTopDemandedTechnologies() { return topDemandedTechnologies; }
    public List<OpportunityCluster> getOpportunityClusters() { return opportunityClusters; }
    public List<SkillLeverageMetric> getHighestLeverageSkills() { return highestLeverageSkills; }
    public List<EvidenceRoiDto> getRecommendedRoiProjects() { return recommendedRoiProjects; }
    public Map<String, Integer> getPortfolioSavedCategories() { return portfolioSavedCategories; }
    public String getHighestLeverageRecommendation() { return highestLeverageRecommendation; }
}
