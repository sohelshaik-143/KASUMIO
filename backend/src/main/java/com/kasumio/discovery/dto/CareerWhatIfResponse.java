package com.kasumio.discovery.dto;

import java.util.List;

/**
 * Counterfactual / What-If Intelligence Response
 * Clearly marked as MODELED SCENARIO.
 */
public class CareerWhatIfResponse {

    public static class ModeledOpportunityDelta {
        private Long opportunityId;
        private String opportunityTitle;
        private String organizationName;
        private int currentScore;
        private int modeledScore;
        private int scoreDelta;
        private String currentMatchCategory;
        private String modeledMatchCategory;
        private boolean isNewlyUnlocked; // Promoted to Strong or Potential Match

        public ModeledOpportunityDelta() {}

        public ModeledOpportunityDelta(Long opportunityId, String opportunityTitle, String organizationName,
                                       int currentScore, int modeledScore, int scoreDelta,
                                       String currentMatchCategory, String modeledMatchCategory,
                                       boolean isNewlyUnlocked) {
            this.opportunityId = opportunityId;
            this.opportunityTitle = opportunityTitle;
            this.organizationName = organizationName;
            this.currentScore = currentScore;
            this.modeledScore = modeledScore;
            this.scoreDelta = scoreDelta;
            this.currentMatchCategory = currentMatchCategory;
            this.modeledMatchCategory = modeledMatchCategory;
            this.isNewlyUnlocked = isNewlyUnlocked;
        }

        public Long getOpportunityId() { return opportunityId; }
        public String getOpportunityTitle() { return opportunityTitle; }
        public String getOrganizationName() { return organizationName; }
        public int getCurrentScore() { return currentScore; }
        public int getModeledScore() { return modeledScore; }
        public int getScoreDelta() { return scoreDelta; }
        public String getCurrentMatchCategory() { return currentMatchCategory; }
        public String getModeledMatchCategory() { return modeledMatchCategory; }
        public boolean isNewlyUnlocked() { return isNewlyUnlocked; }
    }

    private String simulatedSkillName;
    private String scenarioDisclaimer = "MODELED SCENARIO — Based on active database opportunities and deterministic scoring rules. Does not guarantee employment.";
    private int currentRelevantOpportunitiesCount;
    private int modeledRelevantOpportunitiesCount;
    private int netOpportunitiesUnlocked;
    private double currentAverageMatchScore;
    private double modeledAverageMatchScore;
    private List<ModeledOpportunityDelta> topImpactedOpportunities;
    private List<String> unblockedRoleTitles;

    public CareerWhatIfResponse() {}

    public CareerWhatIfResponse(String simulatedSkillName, int currentRelevantOpportunitiesCount,
                                int modeledRelevantOpportunitiesCount, int netOpportunitiesUnlocked,
                                double currentAverageMatchScore, double modeledAverageMatchScore,
                                List<ModeledOpportunityDelta> topImpactedOpportunities,
                                List<String> unblockedRoleTitles) {
        this.simulatedSkillName = simulatedSkillName;
        this.scenarioDisclaimer = "MODELED SCENARIO — Based on active database opportunities and deterministic scoring rules. Does not guarantee employment.";
        this.currentRelevantOpportunitiesCount = currentRelevantOpportunitiesCount;
        this.modeledRelevantOpportunitiesCount = modeledRelevantOpportunitiesCount;
        this.netOpportunitiesUnlocked = netOpportunitiesUnlocked;
        this.currentAverageMatchScore = currentAverageMatchScore;
        this.modeledAverageMatchScore = modeledAverageMatchScore;
        this.topImpactedOpportunities = topImpactedOpportunities;
        this.unblockedRoleTitles = unblockedRoleTitles;
    }

    public String getSimulatedSkillName() { return simulatedSkillName; }
    public String getScenarioDisclaimer() { return scenarioDisclaimer; }
    public int getCurrentRelevantOpportunitiesCount() { return currentRelevantOpportunitiesCount; }
    public int getModeledRelevantOpportunitiesCount() { return modeledRelevantOpportunitiesCount; }
    public int getNetOpportunitiesUnlocked() { return netOpportunitiesUnlocked; }
    public double getCurrentAverageMatchScore() { return currentAverageMatchScore; }
    public double getModeledAverageMatchScore() { return modeledAverageMatchScore; }
    public List<ModeledOpportunityDelta> getTopImpactedOpportunities() { return topImpactedOpportunities; }
    public List<String> getUnblockedRoleTitles() { return unblockedRoleTitles; }
}
