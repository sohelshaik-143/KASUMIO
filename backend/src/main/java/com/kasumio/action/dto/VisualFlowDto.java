package com.kasumio.action.dto;

public class VisualFlowDto {

    private String currentTech;
    private String gapTech;
    private String actionTitle;
    private String expectedEvidence;
    private String targetOutcome;

    public VisualFlowDto() {}

    public VisualFlowDto(String currentTech, String gapTech, String actionTitle, String expectedEvidence, String targetOutcome) {
        this.currentTech = currentTech;
        this.gapTech = gapTech;
        this.actionTitle = actionTitle;
        this.expectedEvidence = expectedEvidence;
        this.targetOutcome = targetOutcome;
    }

    public String getCurrentTech() {
        return currentTech;
    }

    public void setCurrentTech(String currentTech) {
        this.currentTech = currentTech;
    }

    public String getGapTech() {
        return gapTech;
    }

    public void setGapTech(String gapTech) {
        this.gapTech = gapTech;
    }

    public String getActionTitle() {
        return actionTitle;
    }

    public void setActionTitle(String actionTitle) {
        this.actionTitle = actionTitle;
    }

    public String getExpectedEvidence() {
        return expectedEvidence;
    }

    public void setExpectedEvidence(String expectedEvidence) {
        this.expectedEvidence = expectedEvidence;
    }

    public String getTargetOutcome() {
        return targetOutcome;
    }

    public void setTargetOutcome(String targetOutcome) {
        this.targetOutcome = targetOutcome;
    }
}
