package com.kasumio.action.dto;

import jakarta.validation.constraints.NotBlank;

public class CareerActionFeedbackRequest {

    @NotBlank(message = "Action ID is required")
    private String actionId;

    @NotBlank(message = "Feedback type is required")
    private String feedbackType; // HELPFUL, NOT_HELPFUL, ALREADY_KNOW, TOO_DIFFICULT, NOT_RELEVANT, WRONG_GOAL, ALREADY_COMPLETED, NOT_INTERESTED

    private String feedbackText;

    public CareerActionFeedbackRequest() {}

    public CareerActionFeedbackRequest(String actionId, String feedbackType, String feedbackText) {
        this.actionId = actionId;
        this.feedbackType = feedbackType;
        this.feedbackText = feedbackText;
    }

    public String getActionId() {
        return actionId;
    }

    public void setActionId(String actionId) {
        this.actionId = actionId;
    }

    public String getFeedbackType() {
        return feedbackType;
    }

    public void setFeedbackType(String feedbackType) {
        this.feedbackType = feedbackType;
    }

    public String getFeedbackText() {
        return feedbackText;
    }

    public void setFeedbackText(String feedbackText) {
        this.feedbackText = feedbackText;
    }
}
