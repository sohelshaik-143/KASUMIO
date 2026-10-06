package com.kasumio.agent;

import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.WorkType;
import com.kasumio.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "recruiter_intents")
public class RecruiterIntent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @Column(name = "raw_intent", nullable = false, columnDefinition = "TEXT")
    private String rawIntent;

    @Column(name = "extracted_role_title")
    private String extractedRoleTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "extracted_opportunity_type", nullable = false)
    private OpportunityType extractedOpportunityType = OpportunityType.INTERNSHIP;

    @Enumerated(EnumType.STRING)
    @Column(name = "extracted_work_type", nullable = false)
    private WorkType extractedWorkType = WorkType.REMOTE;

    @Column(name = "extracted_location")
    private String extractedLocation;

    @Column(name = "structured_payload", columnDefinition = "TEXT")
    private String structuredPayload;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public RecruiterIntent() {}

    public RecruiterIntent(User recruiter, String rawIntent, String extractedRoleTitle,
                           OpportunityType extractedOpportunityType, WorkType extractedWorkType,
                           String extractedLocation, String structuredPayload) {
        this.recruiter = recruiter;
        this.rawIntent = rawIntent;
        this.extractedRoleTitle = extractedRoleTitle;
        this.extractedOpportunityType = extractedOpportunityType != null ? extractedOpportunityType : OpportunityType.INTERNSHIP;
        this.extractedWorkType = extractedWorkType != null ? extractedWorkType : WorkType.REMOTE;
        this.extractedLocation = extractedLocation;
        this.structuredPayload = structuredPayload;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public User getRecruiter() { return recruiter; }
    public void setRecruiter(User recruiter) { this.recruiter = recruiter; }
    public String getRawIntent() { return rawIntent; }
    public void setRawIntent(String rawIntent) { this.rawIntent = rawIntent; }
    public String getExtractedRoleTitle() { return extractedRoleTitle; }
    public void setExtractedRoleTitle(String extractedRoleTitle) { this.extractedRoleTitle = extractedRoleTitle; }
    public OpportunityType getExtractedOpportunityType() { return extractedOpportunityType; }
    public void setExtractedOpportunityType(OpportunityType extractedOpportunityType) { this.extractedOpportunityType = extractedOpportunityType; }
    public WorkType getExtractedWorkType() { return extractedWorkType; }
    public void setExtractedWorkType(WorkType extractedWorkType) { this.extractedWorkType = extractedWorkType; }
    public String getExtractedLocation() { return extractedLocation; }
    public void setExtractedLocation(String extractedLocation) { this.extractedLocation = extractedLocation; }
    public String getStructuredPayload() { return structuredPayload; }
    public void setStructuredPayload(String structuredPayload) { this.structuredPayload = structuredPayload; }
    public Instant getCreatedAt() { return createdAt; }
}
