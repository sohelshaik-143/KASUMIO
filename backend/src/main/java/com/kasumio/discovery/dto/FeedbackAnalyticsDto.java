package com.kasumio.discovery.dto;

public class FeedbackAnalyticsDto {

    private long totalRecommendations;
    private long totalFeedback;
    private long relevantCount;
    private long notRelevantCount;
    private long techCorrectionCount;
    private double acceptanceRate;
    private double negativeFeedbackRate;

    public FeedbackAnalyticsDto() {}

    public FeedbackAnalyticsDto(long totalRecommendations, long totalFeedback, long relevantCount,
                                long notRelevantCount, long techCorrectionCount, double acceptanceRate,
                                double negativeFeedbackRate) {
        this.totalRecommendations = totalRecommendations;
        this.totalFeedback = totalFeedback;
        this.relevantCount = relevantCount;
        this.notRelevantCount = notRelevantCount;
        this.techCorrectionCount = techCorrectionCount;
        this.acceptanceRate = acceptanceRate;
        this.negativeFeedbackRate = negativeFeedbackRate;
    }

    public long getTotalRecommendations() {
        return totalRecommendations;
    }

    public void setTotalRecommendations(long totalRecommendations) {
        this.totalRecommendations = totalRecommendations;
    }

    public long getTotalFeedback() {
        return totalFeedback;
    }

    public void setTotalFeedback(long totalFeedback) {
        this.totalFeedback = totalFeedback;
    }

    public long getRelevantCount() {
        return relevantCount;
    }

    public void setRelevantCount(long relevantCount) {
        this.relevantCount = relevantCount;
    }

    public long getNotRelevantCount() {
        return notRelevantCount;
    }

    public void setNotRelevantCount(long notRelevantCount) {
        this.notRelevantCount = notRelevantCount;
    }

    public long getTechCorrectionCount() {
        return techCorrectionCount;
    }

    public void setTechCorrectionCount(long techCorrectionCount) {
        this.techCorrectionCount = techCorrectionCount;
    }

    public double getAcceptanceRate() {
        return acceptanceRate;
    }

    public void setAcceptanceRate(double acceptanceRate) {
        this.acceptanceRate = acceptanceRate;
    }

    public double getNegativeFeedbackRate() {
        return negativeFeedbackRate;
    }

    public void setNegativeFeedbackRate(double negativeFeedbackRate) {
        this.negativeFeedbackRate = negativeFeedbackRate;
    }
}
