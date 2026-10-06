package com.kasumio.agent;

import com.kasumio.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "recruiter_automation_policies")
public class RecruiterAutomationPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false, unique = true)
    private User recruiter;

    @Column(name = "max_daily_connections", nullable = false)
    private int maxDailyConnections = 25;

    @Column(name = "min_readiness_threshold", nullable = false)
    private int minReadinessThreshold = 50;

    @Column(name = "require_verified_evidence", nullable = false)
    private boolean requireVerifiedEvidence = false;

    @Column(name = "auto_send_outreach", nullable = false)
    private boolean autoSendOutreach = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public RecruiterAutomationPolicy() {}

    public RecruiterAutomationPolicy(User recruiter) {
        this.recruiter = recruiter;
        this.maxDailyConnections = 25;
        this.minReadinessThreshold = 50;
        this.requireVerifiedEvidence = false;
        this.autoSendOutreach = false;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public User getRecruiter() { return recruiter; }
    public void setRecruiter(User recruiter) { this.recruiter = recruiter; }
    public int getMaxDailyConnections() { return maxDailyConnections; }
    public void setMaxDailyConnections(int maxDailyConnections) { this.maxDailyConnections = maxDailyConnections; }
    public int getMinReadinessThreshold() { return minReadinessThreshold; }
    public void setMinReadinessThreshold(int minReadinessThreshold) { this.minReadinessThreshold = minReadinessThreshold; }
    public boolean isRequireVerifiedEvidence() { return requireVerifiedEvidence; }
    public void setRequireVerifiedEvidence(boolean requireVerifiedEvidence) { this.requireVerifiedEvidence = requireVerifiedEvidence; }
    public boolean isAutoSendOutreach() { return autoSendOutreach; }
    public void setAutoSendOutreach(boolean autoSendOutreach) { this.autoSendOutreach = autoSendOutreach; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
