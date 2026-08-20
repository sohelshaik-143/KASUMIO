package com.kasumio.action.dto;

import com.kasumio.opportunity.EvidenceRoi;
import java.util.List;

public class CareerActionDetailDto {

    private String id;
    private String title;
    private String description;
    private String whatToDo;
    private String whyItMatters;
    private String reusedProject;
    private String capabilityStrengthened;
    private List<String> targetedOpportunities;
    private EvidenceRoi evidenceRoi;
    private String estimatedEffort;
    private String successCriteria;
    private String suggestedPreparation;
    private String suggestedTemplateTitle;

    public CareerActionDetailDto() {}

    public CareerActionDetailDto(String id, String title, String description, String whatToDo,
                                 String whyItMatters, String reusedProject, String capabilityStrengthened,
                                 List<String> targetedOpportunities, EvidenceRoi evidenceRoi,
                                 String estimatedEffort, String successCriteria, String suggestedPreparation,
                                 String suggestedTemplateTitle) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.whatToDo = whatToDo;
        this.whyItMatters = whyItMatters;
        this.reusedProject = reusedProject;
        this.capabilityStrengthened = capabilityStrengthened;
        this.targetedOpportunities = targetedOpportunities;
        this.evidenceRoi = evidenceRoi;
        this.estimatedEffort = estimatedEffort;
        this.successCriteria = successCriteria;
        this.suggestedPreparation = suggestedPreparation;
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

    public String getWhatToDo() {
        return whatToDo;
    }

    public void setWhatToDo(String whatToDo) {
        this.whatToDo = whatToDo;
    }

    public String getWhyItMatters() {
        return whyItMatters;
    }

    public void setWhyItMatters(String whyItMatters) {
        this.whyItMatters = whyItMatters;
    }

    public String getReusedProject() {
        return reusedProject;
    }

    public void setReusedProject(String reusedProject) {
        this.reusedProject = reusedProject;
    }

    public String getCapabilityStrengthened() {
        return capabilityStrengthened;
    }

    public void setCapabilityStrengthened(String capabilityStrengthened) {
        this.capabilityStrengthened = capabilityStrengthened;
    }

    public List<String> getTargetedOpportunities() {
        return targetedOpportunities;
    }

    public void setTargetedOpportunities(List<String> targetedOpportunities) {
        this.targetedOpportunities = targetedOpportunities;
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

    public String getSuccessCriteria() {
        return successCriteria;
    }

    public void setSuccessCriteria(String successCriteria) {
        this.successCriteria = successCriteria;
    }

    public String getSuggestedPreparation() {
        return suggestedPreparation;
    }

    public void setSuggestedPreparation(String suggestedPreparation) {
        this.suggestedPreparation = suggestedPreparation;
    }

    public String getSuggestedTemplateTitle() {
        return suggestedTemplateTitle;
    }

    public void setSuggestedTemplateTitle(String suggestedTemplateTitle) {
        this.suggestedTemplateTitle = suggestedTemplateTitle;
    }
}
