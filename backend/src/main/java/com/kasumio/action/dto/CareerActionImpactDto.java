package com.kasumio.action.dto;

import com.kasumio.opportunity.EvidenceRoi;

public class CareerActionImpactDto {

    private String actionId;
    private String targetSkillName;
    private EvidenceRoi evidenceRoi;
    private int opportunitiesImprovedCount;
    private String readinessImpactSummary;

    public CareerActionImpactDto() {}

    public CareerActionImpactDto(String actionId, String targetSkillName, EvidenceRoi evidenceRoi,
                                 int opportunitiesImprovedCount, String readinessImpactSummary) {
        this.actionId = actionId;
        this.targetSkillName = targetSkillName;
        this.evidenceRoi = evidenceRoi;
        this.opportunitiesImprovedCount = opportunitiesImprovedCount;
        this.readinessImpactSummary = readinessImpactSummary;
    }

    public String getActionId() {
        return actionId;
    }

    public void setActionId(String actionId) {
        this.actionId = actionId;
    }

    public String getTargetSkillName() {
        return targetSkillName;
    }

    public void setTargetSkillName(String targetSkillName) {
        this.targetSkillName = targetSkillName;
    }

    public EvidenceRoi getEvidenceRoi() {
        return evidenceRoi;
    }

    public void setEvidenceRoi(EvidenceRoi evidenceRoi) {
        this.evidenceRoi = evidenceRoi;
    }

    public int getOpportunitiesImprovedCount() {
        return opportunitiesImprovedCount;
    }

    public void setOpportunitiesImprovedCount(int opportunitiesImprovedCount) {
        this.opportunitiesImprovedCount = opportunitiesImprovedCount;
    }

    public String getReadinessImpactSummary() {
        return readinessImpactSummary;
    }

    public void setReadinessImpactSummary(String readinessImpactSummary) {
        this.readinessImpactSummary = readinessImpactSummary;
    }
}
