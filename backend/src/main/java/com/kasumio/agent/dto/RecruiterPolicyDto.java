package com.kasumio.agent.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class RecruiterPolicyDto {

    @Min(value = 1, message = "Max daily connections must be at least 1")
    @Max(value = 100, message = "Max daily connections cannot exceed 100")
    private int maxDailyConnections = 25;

    @Min(value = 0, message = "Min readiness threshold must be at least 0")
    @Max(value = 100, message = "Min readiness threshold cannot exceed 100")
    private int minReadinessThreshold = 50;

    private boolean requireVerifiedEvidence = false;
    private boolean autoSendOutreach = false;

    public RecruiterPolicyDto() {}

    public RecruiterPolicyDto(int maxDailyConnections, int minReadinessThreshold,
                              boolean requireVerifiedEvidence, boolean autoSendOutreach) {
        this.maxDailyConnections = maxDailyConnections;
        this.minReadinessThreshold = minReadinessThreshold;
        this.requireVerifiedEvidence = requireVerifiedEvidence;
        this.autoSendOutreach = autoSendOutreach;
    }

    public int getMaxDailyConnections() { return maxDailyConnections; }
    public void setMaxDailyConnections(int maxDailyConnections) { this.maxDailyConnections = maxDailyConnections; }
    public int getMinReadinessThreshold() { return minReadinessThreshold; }
    public void setMinReadinessThreshold(int minReadinessThreshold) { this.minReadinessThreshold = minReadinessThreshold; }
    public boolean isRequireVerifiedEvidence() { return requireVerifiedEvidence; }
    public void setRequireVerifiedEvidence(boolean requireVerifiedEvidence) { this.requireVerifiedEvidence = requireVerifiedEvidence; }
    public boolean isAutoSendOutreach() { return autoSendOutreach; }
    public void setAutoSendOutreach(boolean autoSendOutreach) { this.autoSendOutreach = autoSendOutreach; }
}
