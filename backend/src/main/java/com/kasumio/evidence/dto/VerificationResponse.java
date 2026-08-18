package com.kasumio.evidence.dto;

import java.time.Instant;

public class VerificationResponse {
    private Long id;
    private Long organizationId;
    private String organizationName;
    private Long verifiedByUserId;
    private String verifiedByUserEmail;
    private Instant verifiedAt;

    public VerificationResponse() {}

    public VerificationResponse(Long id, Long organizationId, String organizationName, Long verifiedByUserId, String verifiedByUserEmail, Instant verifiedAt) {
        this.id = id;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.verifiedByUserId = verifiedByUserId;
        this.verifiedByUserEmail = verifiedByUserEmail;
        this.verifiedAt = verifiedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public Long getVerifiedByUserId() {
        return verifiedByUserId;
    }

    public void setVerifiedByUserId(Long verifiedByUserId) {
        this.verifiedByUserId = verifiedByUserId;
    }

    public String getVerifiedByUserEmail() {
        return verifiedByUserEmail;
    }

    public void setVerifiedByUserEmail(String verifiedByUserEmail) {
        this.verifiedByUserEmail = verifiedByUserEmail;
    }

    public Instant getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(Instant verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}
