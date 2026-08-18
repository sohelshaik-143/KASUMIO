package com.kasumio.connection.dto;

import com.kasumio.connection.ConnectionStatus;
import com.kasumio.opportunity.dto.CandidateSkillMatchDto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class RecruiterConnectionResponse {

    private Long id;
    private Long opportunityId;
    private String opportunityTitle;
    private String candidateAlias;
    private ConnectionStatus status;
    private Instant createdAt;
    private Instant expiresAt;
    private Instant respondedAt;
    private String recruiterNote;
    private DisclosedStudentProfileDto disclosedProfile;
    private List<CandidateSkillMatchDto> requiredSkills = new ArrayList<>();
    private List<CandidateSkillMatchDto> preferredSkills = new ArrayList<>();
    private String whySurfaced;

    public RecruiterConnectionResponse() {}

    public RecruiterConnectionResponse(Long id, Long opportunityId, String opportunityTitle,
                                       String candidateAlias, ConnectionStatus status,
                                       Instant createdAt, Instant expiresAt, Instant respondedAt,
                                       String recruiterNote, DisclosedStudentProfileDto disclosedProfile,
                                       List<CandidateSkillMatchDto> requiredSkills,
                                       List<CandidateSkillMatchDto> preferredSkills,
                                       String whySurfaced) {
        this.id = id;
        this.opportunityId = opportunityId;
        this.opportunityTitle = opportunityTitle;
        this.candidateAlias = candidateAlias;
        this.status = status;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.respondedAt = respondedAt;
        this.recruiterNote = recruiterNote;
        this.disclosedProfile = disclosedProfile;
        this.requiredSkills = requiredSkills != null ? requiredSkills : new ArrayList<>();
        this.preferredSkills = preferredSkills != null ? preferredSkills : new ArrayList<>();
        this.whySurfaced = whySurfaced;
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

    public String getCandidateAlias() {
        return candidateAlias;
    }

    public void setCandidateAlias(String candidateAlias) {
        this.candidateAlias = candidateAlias;
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

    public String getRecruiterNote() {
        return recruiterNote;
    }

    public void setRecruiterNote(String recruiterNote) {
        this.recruiterNote = recruiterNote;
    }

    public DisclosedStudentProfileDto getDisclosedProfile() {
        return disclosedProfile;
    }

    public void setDisclosedProfile(DisclosedStudentProfileDto disclosedProfile) {
        this.disclosedProfile = disclosedProfile;
    }

    public List<CandidateSkillMatchDto> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<CandidateSkillMatchDto> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public List<CandidateSkillMatchDto> getPreferredSkills() {
        return preferredSkills;
    }

    public void setPreferredSkills(List<CandidateSkillMatchDto> preferredSkills) {
        this.preferredSkills = preferredSkills;
    }

    public String getWhySurfaced() {
        return whySurfaced;
    }

    public void setWhySurfaced(String whySurfaced) {
        this.whySurfaced = whySurfaced;
    }
}
