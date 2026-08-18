package com.kasumio.discovery.dto;

import jakarta.validation.constraints.NotBlank;

public class SaveOpportunityRequest {

    @NotBlank
    private String status = "SAVED"; // SAVED, APPLIED, REJECTED, ARCHIVED

    public SaveOpportunityRequest() {}

    public SaveOpportunityRequest(String status) {
        this.status = status;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
