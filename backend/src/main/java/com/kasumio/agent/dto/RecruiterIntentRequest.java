package com.kasumio.agent.dto;

import com.kasumio.agent.AutomationLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RecruiterIntentRequest {

    @NotBlank(message = "Recruiter intent prompt cannot be empty")
    @Size(min = 10, max = 2000, message = "Intent prompt must be between 10 and 2000 characters")
    private String intent;

    private AutomationLevel automationLevel = AutomationLevel.DELEGATED;
    private Integer minReadinessThreshold;
    private Integer maxCandidates = 10;

    public RecruiterIntentRequest() {}

    public RecruiterIntentRequest(String intent) {
        this.intent = intent;
    }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }
    public AutomationLevel getAutomationLevel() { return automationLevel; }
    public void setAutomationLevel(AutomationLevel automationLevel) { this.automationLevel = automationLevel; }
    public Integer getMinReadinessThreshold() { return minReadinessThreshold; }
    public void setMinReadinessThreshold(Integer minReadinessThreshold) { this.minReadinessThreshold = minReadinessThreshold; }
    public Integer getMaxCandidates() { return maxCandidates; }
    public void setMaxCandidates(Integer maxCandidates) { this.maxCandidates = maxCandidates; }
}
