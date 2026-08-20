package com.kasumio.discovery.dto;

public class RecommendationFeedbackRequest {

    private String feedbackType; // RELEVANT, NOT_RELEVANT, ALREADY_KNOW_THIS, WRONG_REQUIREMENT, NOT_ELIGIBLE, WRONG_TECHNOLOGY, NOT_MY_CAREER_DIRECTION, DEADLINE_PROBLEM, LOCATION_PROBLEM, ALREADY_APPLIED, HELPFUL, NOT_HELPFUL
    private String feedbackText;

    public RecommendationFeedbackRequest() {}

    public RecommendationFeedbackRequest(String feedbackType, String feedbackText) {
        this.feedbackType = feedbackType;
        this.feedbackText = feedbackText;
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
