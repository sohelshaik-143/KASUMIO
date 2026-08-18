package com.kasumio.opportunity.dto;

import com.kasumio.opportunity.OpportunityStatus;
import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.WorkType;
import java.time.Instant;

public class OpportunitySummaryResponse {

    private Long id;
    private String title;
    private OpportunityType type;
    private String location;
    private WorkType workType;
    private OpportunityStatus status;
    private Instant createdAt;
    private int requiredSkillsCount;
    private int preferredSkillsCount;
    private long matchedCandidatesCount;

    public OpportunitySummaryResponse() {}

    public OpportunitySummaryResponse(Long id, String title, OpportunityType type, String location, WorkType workType,
                                    OpportunityStatus status, Instant createdAt, int requiredSkillsCount,
                                    int preferredSkillsCount, long matchedCandidatesCount) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.location = location;
        this.workType = workType;
        this.status = status;
        this.createdAt = createdAt;
        this.requiredSkillsCount = requiredSkillsCount;
        this.preferredSkillsCount = preferredSkillsCount;
        this.matchedCandidatesCount = matchedCandidatesCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public int getRequiredSkillsCount() {
        return requiredSkillsCount;
    }

    public void setRequiredSkillsCount(int requiredSkillsCount) {
        this.requiredSkillsCount = requiredSkillsCount;
    }

    public int getPreferredSkillsCount() {
        return preferredSkillsCount;
    }

    public void setPreferredSkillsCount(int preferredSkillsCount) {
        this.preferredSkillsCount = preferredSkillsCount;
    }

    public long getMatchedCandidatesCount() {
        return matchedCandidatesCount;
    }

    public void setMatchedCandidatesCount(long matchedCandidatesCount) {
        this.matchedCandidatesCount = matchedCandidatesCount;
    }
}
