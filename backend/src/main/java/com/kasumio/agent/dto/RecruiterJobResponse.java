package com.kasumio.agent.dto;

import com.kasumio.agent.AutomationLevel;
import com.kasumio.agent.JobStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class RecruiterJobResponse {
    private String jobId;
    private JobStatus status;
    private AutomationLevel automationLevel;
    private Long opportunityId;
    private ParsedIntentDto parsedIntent;
    private int totalCandidatesScanned;
    private int candidatesMatchedCount;
    private int candidatesShortlistedCount;
    private int outreachSentCount;
    private List<CandidateRecommendationDto> recommendations = new ArrayList<>();
    private String errorMessage;
    private Instant createdAt;
    private Instant updatedAt;

    public RecruiterJobResponse() {}

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }
    public AutomationLevel getAutomationLevel() { return automationLevel; }
    public void setAutomationLevel(AutomationLevel automationLevel) { this.automationLevel = automationLevel; }
    public Long getOpportunityId() { return opportunityId; }
    public void setOpportunityId(Long opportunityId) { this.opportunityId = opportunityId; }
    public ParsedIntentDto getParsedIntent() { return parsedIntent; }
    public void setParsedIntent(ParsedIntentDto parsedIntent) { this.parsedIntent = parsedIntent; }
    public int getTotalCandidatesScanned() { return totalCandidatesScanned; }
    public void setTotalCandidatesScanned(int totalCandidatesScanned) { this.totalCandidatesScanned = totalCandidatesScanned; }
    public int getCandidatesMatchedCount() { return candidatesMatchedCount; }
    public void setCandidatesMatchedCount(int candidatesMatchedCount) { this.candidatesMatchedCount = candidatesMatchedCount; }
    public int getCandidatesShortlistedCount() { return candidatesShortlistedCount; }
    public void setCandidatesShortlistedCount(int candidatesShortlistedCount) { this.candidatesShortlistedCount = candidatesShortlistedCount; }
    public int getOutreachSentCount() { return outreachSentCount; }
    public void setOutreachSentCount(int outreachSentCount) { this.outreachSentCount = outreachSentCount; }
    public List<CandidateRecommendationDto> getRecommendations() { return recommendations; }
    public void setRecommendations(List<CandidateRecommendationDto> recommendations) { this.recommendations = recommendations; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
