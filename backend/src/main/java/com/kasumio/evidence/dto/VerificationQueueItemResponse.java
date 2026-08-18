package com.kasumio.evidence.dto;

import com.kasumio.evidence.EvidenceType;
import com.kasumio.evidence.VerificationStatus;
import com.kasumio.opportunity.OpportunityType;
import java.time.Instant;

public class VerificationQueueItemResponse {

    private Long id;
    private Long opportunityId;
    private String opportunityTitle;
    private OpportunityType opportunityType;
    private String candidateAlias;
    private Long evidenceId;
    private String evidenceTitle;
    private EvidenceType evidenceType;
    private String skillName;
    private String skillCategory;
    private VerificationStatus status;
    private Instant requestedAt;
    private Instant respondedAt;
    private String recruiterComment;
    private boolean hasExpressedInterest;

    public VerificationQueueItemResponse() {}

    public VerificationQueueItemResponse(Long id, Long opportunityId, String opportunityTitle, OpportunityType opportunityType,
                                        String candidateAlias, Long evidenceId, String evidenceTitle, EvidenceType evidenceType,
                                        String skillName, String skillCategory, VerificationStatus status, Instant requestedAt,
                                        Instant respondedAt, String recruiterComment, boolean hasExpressedInterest) {
        this.id = id;
        this.opportunityId = opportunityId;
        this.opportunityTitle = opportunityTitle;
        this.opportunityType = opportunityType;
        this.candidateAlias = candidateAlias;
        this.evidenceId = evidenceId;
        this.evidenceTitle = evidenceTitle;
        this.evidenceType = evidenceType;
        this.skillName = skillName;
        this.skillCategory = skillCategory;
        this.status = status;
        this.requestedAt = requestedAt;
        this.respondedAt = respondedAt;
        this.recruiterComment = recruiterComment;
        this.hasExpressedInterest = hasExpressedInterest;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public OpportunityType getOpportunityType() {
        return opportunityType;
    }

    public void setOpportunityType(OpportunityType opportunityType) {
        this.opportunityType = opportunityType;
    }

    public String getCandidateAlias() {
        return candidateAlias;
    }

    public void setCandidateAlias(String candidateAlias) {
        this.candidateAlias = candidateAlias;
    }

    public Long getEvidenceId() {
        return evidenceId;
    }

    public void setEvidenceId(Long evidenceId) {
        this.evidenceId = evidenceId;
    }

    public String getEvidenceTitle() {
        return evidenceTitle;
    }

    public void setEvidenceTitle(String evidenceTitle) {
        this.evidenceTitle = evidenceTitle;
    }

    public EvidenceType getEvidenceType() {
        return evidenceType;
    }

    public void setEvidenceType(EvidenceType evidenceType) {
        this.evidenceType = evidenceType;
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

    public String getRecruiterComment() {
        return recruiterComment;
    }

    public void setRecruiterComment(String recruiterComment) {
        this.recruiterComment = recruiterComment;
    }

    public boolean isHasExpressedInterest() {
        return hasExpressedInterest;
    }

    public void setHasExpressedInterest(boolean hasExpressedInterest) {
        this.hasExpressedInterest = hasExpressedInterest;
    }
}
