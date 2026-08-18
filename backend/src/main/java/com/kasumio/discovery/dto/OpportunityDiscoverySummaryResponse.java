package com.kasumio.discovery.dto;

import com.kasumio.opportunity.OpportunityStatus;
import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.WorkType;

import java.time.Instant;
import java.util.List;

public class OpportunityDiscoverySummaryResponse {
    private Long id;
    private String title;
    private String organizationName;
    private OpportunityType type;
    private String location;
    private WorkType workType;
    private OpportunityStatus status;
    private Instant createdAt;
    private Instant deadline;
    private String compensation;
    private String duration;
    private String verificationStatus;
    private int matchScore;
    private String matchCategory;
    private String whyRecommended;
    private String deadlineNote;
    private List<String> strongSkills;
    private List<String> missingSkills;
    private boolean hasExpressedInterest;
    private boolean isSaved;
    private String saveStatus;

    public OpportunityDiscoverySummaryResponse() {}

    public OpportunityDiscoverySummaryResponse(
            Long id, String title, String organizationName, OpportunityType type,
            String location, WorkType workType, OpportunityStatus status, Instant createdAt,
            Instant deadline, String compensation, String duration, String verificationStatus,
            int matchScore, String matchCategory, String whyRecommended, String deadlineNote,
            List<String> strongSkills, List<String> missingSkills, boolean hasExpressedInterest,
            boolean isSaved, String saveStatus) {
        this.id = id;
        this.title = title;
        this.organizationName = organizationName;
        this.type = type;
        this.location = location;
        this.workType = workType;
        this.status = status;
        this.createdAt = createdAt;
        this.deadline = deadline;
        this.compensation = compensation;
        this.duration = duration;
        this.verificationStatus = verificationStatus;
        this.matchScore = matchScore;
        this.matchCategory = matchCategory;
        this.whyRecommended = whyRecommended;
        this.deadlineNote = deadlineNote;
        this.strongSkills = strongSkills;
        this.missingSkills = missingSkills;
        this.hasExpressedInterest = hasExpressedInterest;
        this.isSaved = isSaved;
        this.saveStatus = saveStatus;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getOrganizationName() { return organizationName; }
    public OpportunityType getType() { return type; }
    public String getLocation() { return location; }
    public WorkType getWorkType() { return workType; }
    public OpportunityStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getDeadline() { return deadline; }
    public String getCompensation() { return compensation; }
    public String getDuration() { return duration; }
    public String getVerificationStatus() { return verificationStatus; }
    public int getMatchScore() { return matchScore; }
    public String getMatchCategory() { return matchCategory; }
    public String getWhyRecommended() { return whyRecommended; }
    public String getDeadlineNote() { return deadlineNote; }
    public List<String> getStrongSkills() { return strongSkills; }
    public List<String> getMissingSkills() { return missingSkills; }
    public boolean isHasExpressedInterest() { return hasExpressedInterest; }
    public boolean isSaved() { return isSaved; }
    public String getSaveStatus() { return saveStatus; }
}
