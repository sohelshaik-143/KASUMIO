package com.kasumio.action.dto;

import java.util.List;

public class OutcomeIntelligenceDto {
    private String careerGoalTitle;
    private int totalEvidenceCount;
    private int verifiedEvidenceCount;
    private int staleEvidenceCount;
    private int completedActionsCount;
    private int newlyMatchedOpportunitiesCount;
    private String overallReadinessSummary;
    private List<CapabilityTransitionDto> capabilityTransitions;
    private List<DecisionTraceDto> recentTraces;
    private VisualFlowDto visualFlow;

    public OutcomeIntelligenceDto() {}

    public OutcomeIntelligenceDto(
            String careerGoalTitle,
            int totalEvidenceCount,
            int verifiedEvidenceCount,
            int staleEvidenceCount,
            int completedActionsCount,
            int newlyMatchedOpportunitiesCount,
            String overallReadinessSummary,
            List<CapabilityTransitionDto> capabilityTransitions,
            List<DecisionTraceDto> recentTraces,
            VisualFlowDto visualFlow) {
        this.careerGoalTitle = careerGoalTitle;
        this.totalEvidenceCount = totalEvidenceCount;
        this.verifiedEvidenceCount = verifiedEvidenceCount;
        this.staleEvidenceCount = staleEvidenceCount;
        this.completedActionsCount = completedActionsCount;
        this.newlyMatchedOpportunitiesCount = newlyMatchedOpportunitiesCount;
        this.overallReadinessSummary = overallReadinessSummary;
        this.capabilityTransitions = capabilityTransitions;
        this.recentTraces = recentTraces;
        this.visualFlow = visualFlow;
    }

    public String getCareerGoalTitle() { return careerGoalTitle; }
    public void setCareerGoalTitle(String careerGoalTitle) { this.careerGoalTitle = careerGoalTitle; }

    public int getTotalEvidenceCount() { return totalEvidenceCount; }
    public void setTotalEvidenceCount(int totalEvidenceCount) { this.totalEvidenceCount = totalEvidenceCount; }

    public int getVerifiedEvidenceCount() { return verifiedEvidenceCount; }
    public void setVerifiedEvidenceCount(int verifiedEvidenceCount) { this.verifiedEvidenceCount = verifiedEvidenceCount; }

    public int getStaleEvidenceCount() { return staleEvidenceCount; }
    public void setStaleEvidenceCount(int staleEvidenceCount) { this.staleEvidenceCount = staleEvidenceCount; }

    public int getCompletedActionsCount() { return completedActionsCount; }
    public void setCompletedActionsCount(int completedActionsCount) { this.completedActionsCount = completedActionsCount; }

    public int getNewlyMatchedOpportunitiesCount() { return newlyMatchedOpportunitiesCount; }
    public void setNewlyMatchedOpportunitiesCount(int newlyMatchedOpportunitiesCount) { this.newlyMatchedOpportunitiesCount = newlyMatchedOpportunitiesCount; }

    public String getOverallReadinessSummary() { return overallReadinessSummary; }
    public void setOverallReadinessSummary(String overallReadinessSummary) { this.overallReadinessSummary = overallReadinessSummary; }

    public List<CapabilityTransitionDto> getCapabilityTransitions() { return capabilityTransitions; }
    public void setCapabilityTransitions(List<CapabilityTransitionDto> capabilityTransitions) { this.capabilityTransitions = capabilityTransitions; }

    public List<DecisionTraceDto> getRecentTraces() { return recentTraces; }
    public void setRecentTraces(List<DecisionTraceDto> recentTraces) { this.recentTraces = recentTraces; }

    public VisualFlowDto getVisualFlow() { return visualFlow; }
    public void setVisualFlow(VisualFlowDto visualFlow) { this.visualFlow = visualFlow; }
}
