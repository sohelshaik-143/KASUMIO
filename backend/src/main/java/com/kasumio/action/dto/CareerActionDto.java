package com.kasumio.action.dto;

import com.kasumio.opportunity.EvidenceRoi;

public class CareerActionDto {

    private String id;
    private String title;
    private String description;
    private String reasoning;
    private String targetSkillName;
    private String category;
    private EvidenceRoi evidenceRoi;
    private String estimatedEffort; // Low, Moderate, High
    private String reusedProjectName; // e.g. "Spring Boot REST Service" or null
    private int affectedOpportunitiesCount;
    private String status; // RECOMMENDED, STARTED, COMPLETED, DISMISSED
    private String suggestedTemplateTitle;

    public CareerActionDto() {}

    public CareerActionDto(String id, String title, String description, String reasoning,
                           String targetSkillName, String category, EvidenceRoi evidenceRoi,
                           String estimatedEffort, String reusedProjectName, int affectedOpportunitiesCount,
                           String status, String suggestedTemplateTitle) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.reasoning = reasoning;
        this.targetSkillName = targetSkillName;
        this.category = category;
        this.evidenceRoi = evidenceRoi;
        this.estimatedEffort = estimatedEffort;
        this.reusedProjectName = reusedProjectName;
        this.affectedOpportunitiesCount = affectedOpportunitiesCount;
        this.status = status;
        this.suggestedTemplateTitle = suggestedTemplateTitle;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReasoning() {
        return reasoning;
    }

    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }

    public String getTargetSkillName() {
        return targetSkillName;
    }

    public void setTargetSkillName(String targetSkillName) {
        this.targetSkillName = targetSkillName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public EvidenceRoi getEvidenceRoi() {
        return evidenceRoi;
    }

    public void setEvidenceRoi(EvidenceRoi evidenceRoi) {
        this.evidenceRoi = evidenceRoi;
    }

    public String getEstimatedEffort() {
        return estimatedEffort;
    }

    public void setEstimatedEffort(String estimatedEffort) {
        this.estimatedEffort = estimatedEffort;
    }

    public String getReusedProjectName() {
        return reusedProjectName;
    }

    public void setReusedProjectName(String reusedProjectName) {
        this.reusedProjectName = reusedProjectName;
    }

    public int getAffectedOpportunitiesCount() {
        return affectedOpportunitiesCount;
    }

    public void setAffectedOpportunitiesCount(int affectedOpportunitiesCount) {
        this.affectedOpportunitiesCount = affectedOpportunitiesCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSuggestedTemplateTitle() {
        return suggestedTemplateTitle;
    }

    public void setSuggestedTemplateTitle(String suggestedTemplateTitle) {
        this.suggestedTemplateTitle = suggestedTemplateTitle;
    }
}
