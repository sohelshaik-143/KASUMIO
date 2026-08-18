package com.kasumio.discovery.dto;

import java.util.List;

/**
 * Evidence ROI Recommendation
 * Multi-skill project blueprint that satisfies 3-5 capability gaps simultaneously.
 */
public class EvidenceRoiDto {

    private String projectTitle;
    private String projectDescription;
    private String targetDomain;
    private List<String> targetedSkills;
    private int opportunitiesUnlockedEstimate;
    private String expectedEvidenceStrength;
    private String recommendedTemplateType;
    private String implementationBlueprint;

    public EvidenceRoiDto() {}

    public EvidenceRoiDto(String projectTitle, String projectDescription, String targetDomain,
                          List<String> targetedSkills, int opportunitiesUnlockedEstimate,
                          String expectedEvidenceStrength, String recommendedTemplateType,
                          String implementationBlueprint) {
        this.projectTitle = projectTitle;
        this.projectDescription = projectDescription;
        this.targetDomain = targetDomain;
        this.targetedSkills = targetedSkills;
        this.opportunitiesUnlockedEstimate = opportunitiesUnlockedEstimate;
        this.expectedEvidenceStrength = expectedEvidenceStrength;
        this.recommendedTemplateType = recommendedTemplateType;
        this.implementationBlueprint = implementationBlueprint;
    }

    public String getProjectTitle() { return projectTitle; }
    public String getProjectDescription() { return projectDescription; }
    public String getTargetDomain() { return targetDomain; }
    public List<String> getTargetedSkills() { return targetedSkills; }
    public int getOpportunitiesUnlockedEstimate() { return opportunitiesUnlockedEstimate; }
    public String getExpectedEvidenceStrength() { return expectedEvidenceStrength; }
    public String getRecommendedTemplateType() { return recommendedTemplateType; }
    public String getImplementationBlueprint() { return implementationBlueprint; }
}
