package com.kasumio.discovery.dto;

import com.kasumio.opportunity.OpportunityStatus;
import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.WorkType;

import java.time.Instant;
import java.util.List;

public class OpportunityDiscoveryDetailResponse {
    private Long id;
    private String title;
    private String organizationName;
    private OpportunityType type;
    private String description;
    private String location;
    private WorkType workType;
    private OpportunityStatus status;
    private Instant createdAt;
    private Instant deadline;
    private String source;
    private String sourceUrl;
    private Instant postedAt;
    private Instant lastVerifiedAt;
    private String verificationStatus;
    private String compensation;
    private String duration;
    private String eligibility;
    private String educationRequirements;
    private String experienceRequirements;

    // Intelligence and Match
    private int matchScore;
    private String matchCategory;
    private boolean isEligible;
    private String eligibilityReason;
    private String whyRecommended;
    private String careerAlignmentNote;
    private String deadlineNote;
    private List<TechnologySkillEvaluationDto> skillEvaluations;
    private List<PrioritizedGapDto> gaps;

    // Student interaction states
    private boolean hasExpressedInterest;
    private boolean isSaved;
    private String saveStatus;

    public OpportunityDiscoveryDetailResponse() {}

    public OpportunityDiscoveryDetailResponse(
            Long id, String title, String organizationName, OpportunityType type,
            String description, String location, WorkType workType, OpportunityStatus status,
            Instant createdAt, Instant deadline, String source, String sourceUrl,
            Instant postedAt, Instant lastVerifiedAt, String verificationStatus,
            String compensation, String duration, String eligibility,
            String educationRequirements, String experienceRequirements,
            int matchScore, String matchCategory, boolean isEligible,
            String eligibilityReason, String whyRecommended, String careerAlignmentNote,
            String deadlineNote, List<TechnologySkillEvaluationDto> skillEvaluations,
            List<PrioritizedGapDto> gaps, boolean hasExpressedInterest,
            boolean isSaved, String saveStatus) {
        this.id = id;
        this.title = title;
        this.organizationName = organizationName;
        this.type = type;
        this.description = description;
        this.location = location;
        this.workType = workType;
        this.status = status;
        this.createdAt = createdAt;
        this.deadline = deadline;
        this.source = source;
        this.sourceUrl = sourceUrl;
        this.postedAt = postedAt;
        this.lastVerifiedAt = lastVerifiedAt;
        this.verificationStatus = verificationStatus;
        this.compensation = compensation;
        this.duration = duration;
        this.eligibility = eligibility;
        this.educationRequirements = educationRequirements;
        this.experienceRequirements = experienceRequirements;
        this.matchScore = matchScore;
        this.matchCategory = matchCategory;
        this.isEligible = isEligible;
        this.eligibilityReason = eligibilityReason;
        this.whyRecommended = whyRecommended;
        this.careerAlignmentNote = careerAlignmentNote;
        this.deadlineNote = deadlineNote;
        this.skillEvaluations = skillEvaluations;
        this.gaps = gaps;
        this.hasExpressedInterest = hasExpressedInterest;
        this.isSaved = isSaved;
        this.saveStatus = saveStatus;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getOrganizationName() { return organizationName; }
    public OpportunityType getType() { return type; }
    public String getDescription() { return description; }
    public String getLocation() { return location; }
    public WorkType getWorkType() { return workType; }
    public OpportunityStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getDeadline() { return deadline; }
    public String getSource() { return source; }
    public String getSourceUrl() { return sourceUrl; }
    public Instant getPostedAt() { return postedAt; }
    public Instant getLastVerifiedAt() { return lastVerifiedAt; }
    public String getVerificationStatus() { return verificationStatus; }
    public String getCompensation() { return compensation; }
    public String getDuration() { return duration; }
    public String getEligibility() { return eligibility; }
    public String getEducationRequirements() { return educationRequirements; }
    public String getExperienceRequirements() { return experienceRequirements; }
    public int getMatchScore() { return matchScore; }
    public String getMatchCategory() { return matchCategory; }
    public boolean isEligible() { return isEligible; }
    public String getEligibilityReason() { return eligibilityReason; }
    public String getWhyRecommended() { return whyRecommended; }
    public String getCareerAlignmentNote() { return careerAlignmentNote; }
    public String getDeadlineNote() { return deadlineNote; }
    public List<TechnologySkillEvaluationDto> getSkillEvaluations() { return skillEvaluations; }
    public List<PrioritizedGapDto> getGaps() { return gaps; }
    public boolean isHasExpressedInterest() { return hasExpressedInterest; }
    public boolean isSaved() { return isSaved; }
    public String getSaveStatus() { return saveStatus; }
}
