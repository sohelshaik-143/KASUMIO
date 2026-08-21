package com.kasumio.action;

import com.kasumio.student.Student;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "outcome_decision_traces")
public class OutcomeDecisionTrace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "trace_type", nullable = false)
    private String traceType;

    @Column(name = "target_skill_name", nullable = false)
    private String targetSkillName;

    @Column(name = "before_state", nullable = false)
    private String beforeState;

    @Column(name = "after_state", nullable = false)
    private String afterState;

    @Column(name = "evidence_id")
    private Long evidenceId;

    @Column(name = "verification_id")
    private Long verificationId;

    @Column(name = "action_id")
    private String actionId;

    @Column(name = "opportunity_impact_count", nullable = false)
    private int opportunityImpactCount;

    @Column(name = "rule_applied", nullable = false)
    private String ruleApplied;

    @Column(name = "explanation", nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public OutcomeDecisionTrace() {}

    public OutcomeDecisionTrace(
            Student student,
            String traceType,
            String targetSkillName,
            String beforeState,
            String afterState,
            Long evidenceId,
            Long verificationId,
            String actionId,
            int opportunityImpactCount,
            String ruleApplied,
            String explanation) {
        this.student = student;
        this.traceType = traceType;
        this.targetSkillName = targetSkillName;
        this.beforeState = beforeState;
        this.afterState = afterState;
        this.evidenceId = evidenceId;
        this.verificationId = verificationId;
        this.actionId = actionId;
        this.opportunityImpactCount = opportunityImpactCount;
        this.ruleApplied = ruleApplied;
        this.explanation = explanation;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Student getStudent() {
        return student;
    }

    public String getTraceType() {
        return traceType;
    }

    public String getTargetSkillName() {
        return targetSkillName;
    }

    public String getBeforeState() {
        return beforeState;
    }

    public String getAfterState() {
        return afterState;
    }

    public Long getEvidenceId() {
        return evidenceId;
    }

    public Long getVerificationId() {
        return verificationId;
    }

    public String getActionId() {
        return actionId;
    }

    public int getOpportunityImpactCount() {
        return opportunityImpactCount;
    }

    public String getRuleApplied() {
        return ruleApplied;
    }

    public String getExplanation() {
        return explanation;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
