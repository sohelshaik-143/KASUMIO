package com.kasumio.opportunity.dto;

import com.kasumio.evidence.EvidenceType;
import java.time.Instant;

public class CandidateEvidenceResponse {

    private Long evidenceId;
    private String skillName;
    private String skillCategory;
    private String title;
    private String description;
    private String evidenceUrl;
    private EvidenceType evidenceType;
    private boolean verified;
    private String verificationOrgName;
    private com.kasumio.evidence.VerificationStatus opportunityVerificationStatus;
    private Instant createdAt;
    private boolean recent;

    public CandidateEvidenceResponse() {}

    public CandidateEvidenceResponse(Long evidenceId, String skillName, String skillCategory, String title, String description,
                                     String evidenceUrl, EvidenceType evidenceType, boolean verified,
                                     String verificationOrgName, com.kasumio.evidence.VerificationStatus opportunityVerificationStatus,
                                     Instant createdAt, boolean recent) {
        this.evidenceId = evidenceId;
        this.skillName = skillName;
        this.skillCategory = skillCategory;
        this.title = title;
        this.description = description;
        this.evidenceUrl = evidenceUrl;
        this.evidenceType = evidenceType;
        this.verified = verified;
        this.verificationOrgName = verificationOrgName;
        this.opportunityVerificationStatus = opportunityVerificationStatus;
        this.createdAt = createdAt;
        this.recent = recent;
    }

    public Long getEvidenceId() {
        return evidenceId;
    }

    public void setEvidenceId(Long evidenceId) {
        this.evidenceId = evidenceId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getSkillCategory() {
        return skillCategory;
    }

    public void setSkillCategory(String skillCategory) {
        this.skillCategory = skillCategory;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEvidenceUrl() {
        return evidenceUrl;
    }

    public void setEvidenceUrl(String evidenceUrl) {
        this.evidenceUrl = evidenceUrl;
    }

    public EvidenceType getEvidenceType() {
        return evidenceType;
    }

    public void setEvidenceType(EvidenceType evidenceType) {
        this.evidenceType = evidenceType;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getVerificationOrgName() {
        return verificationOrgName;
    }

    public void setVerificationOrgName(String verificationOrgName) {
        this.verificationOrgName = verificationOrgName;
    }

    public com.kasumio.evidence.VerificationStatus getOpportunityVerificationStatus() {
        return opportunityVerificationStatus;
    }

    public void setOpportunityVerificationStatus(com.kasumio.evidence.VerificationStatus opportunityVerificationStatus) {
        this.opportunityVerificationStatus = opportunityVerificationStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isRecent() {
        return recent;
    }

    public void setRecent(boolean recent) {
        this.recent = recent;
    }
}
