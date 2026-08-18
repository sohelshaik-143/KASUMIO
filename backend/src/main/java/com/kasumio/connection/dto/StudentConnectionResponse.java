package com.kasumio.connection.dto;

import com.kasumio.connection.ConnectionStatus;
import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.WorkType;
import com.kasumio.opportunity.dto.SkillRequirementDto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class StudentConnectionResponse {

    private Long id;
    private Long opportunityId;
    private String opportunityTitle;
    private OpportunityType opportunityType;
    private WorkType workType;
    private String location;
    private String organizationName;
    private String recruiterNote;
    private ConnectionStatus status;
    private Instant createdAt;
    private Instant expiresAt;
    private Instant respondedAt;
    private boolean isExpired;

    // Disclosed flags if accepted
    private boolean shareFullName;
    private boolean shareEmail;
    private boolean shareBio;
    private boolean shareUniversity;
    private boolean shareGraduationYear;
    private String customMessage;

    private List<SkillRequirementDto> requiredSkills = new ArrayList<>();
    private List<SkillRequirementDto> preferredSkills = new ArrayList<>();

    public StudentConnectionResponse() {}

    public StudentConnectionResponse(Long id, Long opportunityId, String opportunityTitle,
                                   OpportunityType opportunityType, WorkType workType,
                                   String location, String organizationName, String recruiterNote,
                                   ConnectionStatus status, Instant createdAt, Instant expiresAt,
                                   Instant respondedAt, boolean isExpired,
                                   boolean shareFullName, boolean shareEmail, boolean shareBio,
                                   boolean shareUniversity, boolean shareGraduationYear,
                                   String customMessage,
                                   List<SkillRequirementDto> requiredSkills,
                                   List<SkillRequirementDto> preferredSkills) {
        this.id = id;
        this.opportunityId = opportunityId;
        this.opportunityTitle = opportunityTitle;
        this.opportunityType = opportunityType;
        this.workType = workType;
        this.location = location;
        this.organizationName = organizationName;
        this.recruiterNote = recruiterNote;
        this.status = status;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.respondedAt = respondedAt;
        this.isExpired = isExpired;
        this.shareFullName = shareFullName;
        this.shareEmail = shareEmail;
        this.shareBio = shareBio;
        this.shareUniversity = shareUniversity;
        this.shareGraduationYear = shareGraduationYear;
        this.customMessage = customMessage;
        this.requiredSkills = requiredSkills != null ? requiredSkills : new ArrayList<>();
        this.preferredSkills = preferredSkills != null ? preferredSkills : new ArrayList<>();
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

    public WorkType getWorkType() {
        return workType;
    }

    public void setWorkType(WorkType workType) {
        this.workType = workType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getRecruiterNote() {
        return recruiterNote;
    }

    public void setRecruiterNote(String recruiterNote) {
        this.recruiterNote = recruiterNote;
    }

    public ConnectionStatus getStatus() {
        return status;
    }

    public void setStatus(ConnectionStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(Instant respondedAt) {
        this.respondedAt = respondedAt;
    }

    public boolean isExpired() {
        return isExpired;
    }

    public void setExpired(boolean expired) {
        isExpired = expired;
    }

    public boolean isShareFullName() {
        return shareFullName;
    }

    public void setShareFullName(boolean shareFullName) {
        this.shareFullName = shareFullName;
    }

    public boolean isShareEmail() {
        return shareEmail;
    }

    public void setShareEmail(boolean shareEmail) {
        this.shareEmail = shareEmail;
    }

    public boolean isShareBio() {
        return shareBio;
    }

    public void setShareBio(boolean shareBio) {
        this.shareBio = shareBio;
    }

    public boolean isShareUniversity() {
        return shareUniversity;
    }

    public void setShareUniversity(boolean shareUniversity) {
        this.shareUniversity = shareUniversity;
    }

    public boolean isShareGraduationYear() {
        return shareGraduationYear;
    }

    public void setShareGraduationYear(boolean shareGraduationYear) {
        this.shareGraduationYear = shareGraduationYear;
    }

    public String getCustomMessage() {
        return customMessage;
    }

    public void setCustomMessage(String customMessage) {
        this.customMessage = customMessage;
    }

    public List<SkillRequirementDto> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<SkillRequirementDto> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public List<SkillRequirementDto> getPreferredSkills() {
        return preferredSkills;
    }

    public void setPreferredSkills(List<SkillRequirementDto> preferredSkills) {
        this.preferredSkills = preferredSkills;
    }
}
