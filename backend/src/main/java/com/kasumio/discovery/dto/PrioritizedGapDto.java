package com.kasumio.discovery.dto;

import java.util.List;

public class PrioritizedGapDto {
    private Long skillId;
    private String skillName;
    private String category;
    private String subcategory;
    private String ecosystem;
    private String priority; // HIGH, MEDIUM, LOW
    private int opportunitiesAffectedCount;
    private boolean isRequiredInKeyRole;
    private String priorityReason;
    private String recommendedAction;
    private List<String> relatedOpportunityTitles;

    public PrioritizedGapDto() {}

    public PrioritizedGapDto(Long skillId, String skillName, String category, String subcategory,
                             String ecosystem, String priority, int opportunitiesAffectedCount,
                             boolean isRequiredInKeyRole, String priorityReason,
                             String recommendedAction, List<String> relatedOpportunityTitles) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.category = category;
        this.subcategory = subcategory;
        this.ecosystem = ecosystem;
        this.priority = priority;
        this.opportunitiesAffectedCount = opportunitiesAffectedCount;
        this.isRequiredInKeyRole = isRequiredInKeyRole;
        this.priorityReason = priorityReason;
        this.recommendedAction = recommendedAction;
        this.relatedOpportunityTitles = relatedOpportunityTitles;
    }

    public Long getSkillId() { return skillId; }
    public String getSkillName() { return skillName; }
    public String getCategory() { return category; }
    public String getSubcategory() { return subcategory; }
    public String getEcosystem() { return ecosystem; }
    public String getPriority() { return priority; }
    public int getOpportunitiesAffectedCount() { return opportunitiesAffectedCount; }
    public boolean isRequiredInKeyRole() { return isRequiredInKeyRole; }
    public String getPriorityReason() { return priorityReason; }
    public String getRecommendedAction() { return recommendedAction; }
    public List<String> getRelatedOpportunityTitles() { return relatedOpportunityTitles; }
}
