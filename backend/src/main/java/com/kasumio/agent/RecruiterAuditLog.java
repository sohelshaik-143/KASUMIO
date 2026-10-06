package com.kasumio.agent;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.kasumio.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "recruiter_action_audit_logs")
public class RecruiterAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @Column(name = "job_id", length = 64)
    private String jobId;

    @Column(name = "action_type", nullable = false, length = 100)
    private String actionType;

    @Column(name = "details", nullable = false, columnDefinition = "TEXT")
    private String details;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public RecruiterAuditLog() {}

    public RecruiterAuditLog(User recruiter, String jobId, String actionType, String details) {
        this.recruiter = recruiter;
        this.jobId = jobId;
        this.actionType = actionType;
        this.details = details;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public User getRecruiter() { return recruiter; }
    public String getJobId() { return jobId; }
    public String getActionType() { return actionType; }
    public String getDetails() { return details; }
    public Instant getCreatedAt() { return createdAt; }
}
