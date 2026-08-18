package com.kasumio.opportunity.dto;

import com.kasumio.opportunity.OpportunityStatus;
import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.WorkType;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class OpportunityResponse {

    private Long id;
    private Long recruiterId;
    private String organizationName;
    private String title;
    private String description;
    private OpportunityType type;
    private String location;
    private WorkType workType;
    private OpportunityStatus status;
    private Instant createdAt;
    private List<SkillRequirementDto> requiredSkills = new ArrayList<>();
    private List<SkillRequirementDto> preferredSkills = new ArrayList<>();
    private long matchedCandidatesCount;

    public OpportunityResponse() {}

    public OpportunityResponse(Long id, Long recruiterId, String organizationName, String title, String description,
                               OpportunityType type, String location, WorkType workType, OpportunityStatus status,
                               Instant createdAt, List<SkillRequirementDto> requiredSkills, List<SkillRequirementDto> preferredSkills,
                               long matchedCandidatesCount) {
        this.id = id;
        this.recruiterId = recruiterId;
        this.organizationName = organizationName;
        this.title = title;
        this.description = description;
        this.type = type;
        this.location = location;
        this.workType = workType;
        this.status = status;
        this.createdAt = createdAt;
        this.requiredSkills = requiredSkills != null ? requiredSkills : new ArrayList<>();
        this.preferredSkills = preferredSkills != null ? preferredSkills : new ArrayList<>();
        this.matchedCandidatesCount = matchedCandidatesCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRecruiterId() {
        return recruiterId;
    }

    public void setRecruiterId(Long recruiterId) {
        this.recruiterId = recruiterId;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
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

    public OpportunityType getType() {
        return type;
    }

    public void setType(OpportunityType type) {
        this.type = type;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public WorkType getWorkType() {
        return workType;
    }

    public void setWorkType(WorkType workType) {
        this.workType = workType;
    }

    public OpportunityStatus getStatus() {
        return status;
    }

    public void setStatus(OpportunityStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
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

    public long getMatchedCandidatesCount() {
        return matchedCandidatesCount;
    }

    public void setMatchedCandidatesCount(long matchedCandidatesCount) {
        this.matchedCandidatesCount = matchedCandidatesCount;
    }
}
