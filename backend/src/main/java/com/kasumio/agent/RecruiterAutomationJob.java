package com.kasumio.agent;

import com.kasumio.opportunity.Opportunity;
import com.kasumio.user.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recruiter_automation_jobs")
public class RecruiterAutomationJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false, unique = true, length = 64)
    private String jobId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id")
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intent_id")
    private RecruiterIntent intent;

    @Enumerated(EnumType.STRING)
    @Column(name = "automation_level", nullable = false)
    private AutomationLevel automationLevel = AutomationLevel.DELEGATED;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private JobStatus status = JobStatus.ANALYZING;

    @Column(name = "total_candidates_scanned", nullable = false)
    private int totalCandidatesScanned = 0;

    @Column(name = "candidates_matched_count", nullable = false)
    private int candidatesMatchedCount = 0;

    @Column(name = "candidates_shortlisted_count", nullable = false)
    private int candidatesShortlistedCount = 0;

    @Column(name = "outreach_sent_count", nullable = false)
    private int outreachSentCount = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CandidateRecommendation> recommendations = new ArrayList<>();

    public RecruiterAutomationJob() {}

    public RecruiterAutomationJob(String jobId, User recruiter, RecruiterIntent intent, AutomationLevel automationLevel) {
        this.jobId = jobId;
        this.recruiter = recruiter;
        this.intent = intent;
        this.automationLevel = automationLevel != null ? automationLevel : AutomationLevel.DELEGATED;
        this.status = JobStatus.ANALYZING;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getJobId() { return jobId; }
    public User getRecruiter() { return recruiter; }
    public Opportunity getOpportunity() { return opportunity; }
    public void setOpportunity(Opportunity opportunity) { this.opportunity = opportunity; }
    public RecruiterIntent getIntent() { return intent; }
    public void setIntent(RecruiterIntent intent) { this.intent = intent; }
    public AutomationLevel getAutomationLevel() { return automationLevel; }
    public void setAutomationLevel(AutomationLevel automationLevel) { this.automationLevel = automationLevel; }
    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }
    public int getTotalCandidatesScanned() { return totalCandidatesScanned; }
    public void setTotalCandidatesScanned(int totalCandidatesScanned) { this.totalCandidatesScanned = totalCandidatesScanned; }
    public int getCandidatesMatchedCount() { return candidatesMatchedCount; }
    public void setCandidatesMatchedCount(int candidatesMatchedCount) { this.candidatesMatchedCount = candidatesMatchedCount; }
    public int getCandidatesShortlistedCount() { return candidatesShortlistedCount; }
    public void setCandidatesShortlistedCount(int candidatesShortlistedCount) { this.candidatesShortlistedCount = candidatesShortlistedCount; }
    public int getOutreachSentCount() { return outreachSentCount; }
    public void setOutreachSentCount(int outreachSentCount) { this.outreachSentCount = outreachSentCount; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<CandidateRecommendation> getRecommendations() { return recommendations; }
    public void setRecommendations(List<CandidateRecommendation> recommendations) { this.recommendations = recommendations; }
}
