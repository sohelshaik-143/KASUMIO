package com.kasumio.evidence.dto;

import com.kasumio.evidence.VerificationStatus;
import java.time.Instant;

public class OpportunityVerificationItemDto {

    private Long opportunityId;
    private String opportunityTitle;
    private VerificationStatus status;
    private Instant requestedAt;
    private Instant respondedAt;

    public OpportunityVerificationItemDto() {}

    public OpportunityVerificationItemDto(Long opportunityId, String opportunityTitle, VerificationStatus status,
                                         Instant requestedAt, Instant respondedAt) {
        this.opportunityId = opportunityId;
        this.opportunityTitle = opportunityTitle;
        this.status = status;
        this.requestedAt = requestedAt;
        this.respondedAt = respondedAt;
    }

    public Long getOpportunityId() {
        return opportunityId;
    }

    public void setOpportunityId(Long opportunityId) {
        this.opportunityId = opportunityId;
    }

    public String getOpportunityTitle() {
        return opportunityTitle;
    }

    public void setOpportunityTitle(String opportunityTitle) {
        this.opportunityTitle = opportunityTitle;
    }

    public VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(VerificationStatus status) {
        this.status = status;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(Instant requestedAt) {
        this.requestedAt = requestedAt;
    }

    public Instant getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(Instant respondedAt) {
        this.respondedAt = respondedAt;
    }
}
