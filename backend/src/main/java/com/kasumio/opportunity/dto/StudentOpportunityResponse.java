package com.kasumio.opportunity.dto;

import com.kasumio.opportunity.InterestStatus;
import com.kasumio.opportunity.OpportunityStatus;
import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.WorkType;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class StudentOpportunityResponse {

    private Long id;
    private String organizationName;
    private String title;
    private String description;
    private OpportunityType type;
    private String location;
    private WorkType workType;
    private OpportunityStatus status;
    private Instant createdAt;
    private String whyRelevant;
    private List<StudentSkillEvaluationDto> skillsChecklist = new ArrayList<>();
    private boolean hasExpressedInterest;
    private InterestStatus interestStatus;

    public StudentOpportunityResponse() {}

    public StudentOpportunityResponse(Long id, String organizationName, String title, String description,
                                      OpportunityType type, String location, WorkType workType,
                                      OpportunityStatus status, Instant createdAt, String whyRelevant,
                                      List<StudentSkillEvaluationDto> skillsChecklist,
                                      boolean hasExpressedInterest, InterestStatus interestStatus) {
        this.id = id;
        this.organizationName = organizationName;
        this.title = title;
        this.description = description;
        this.type = type;
        this.location = location;
        this.workType = workType;
        this.status = status;
        this.createdAt = createdAt;
        this.whyRelevant = whyRelevant;
        this.skillsChecklist = skillsChecklist != null ? skillsChecklist : new ArrayList<>();
        this.hasExpressedInterest = hasExpressedInterest;
        this.interestStatus = interestStatus;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getWhyRelevant() {
        return whyRelevant;
    }

    public void setWhyRelevant(String whyRelevant) {
        this.whyRelevant = whyRelevant;
    }

    public List<StudentSkillEvaluationDto> getSkillsChecklist() {
        return skillsChecklist;
    }

    public void setSkillsChecklist(List<StudentSkillEvaluationDto> skillsChecklist) {
        this.skillsChecklist = skillsChecklist;
    }

    public boolean isHasExpressedInterest() {
        return hasExpressedInterest;
    }

    public void setHasExpressedInterest(boolean hasExpressedInterest) {
        this.hasExpressedInterest = hasExpressedInterest;
    }

    public InterestStatus getInterestStatus() {
        return interestStatus;
    }

    public void setInterestStatus(InterestStatus interestStatus) {
        this.interestStatus = interestStatus;
    }
}
