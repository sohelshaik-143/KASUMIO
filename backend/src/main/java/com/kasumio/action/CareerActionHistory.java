package com.kasumio.action;

import com.kasumio.evidence.Evidence;
import com.kasumio.student.Student;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "career_action_history")
public class CareerActionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "action_id", nullable = false)
    private String actionId;

    @Column(name = "action_title", nullable = false)
    private String actionTitle;

    @Column(name = "target_skill_name")
    private String targetSkillName;

    @Column(name = "status", nullable = false)
    private String status; // RECOMMENDED, STARTED, COMPLETED, DISMISSED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evidence_id")
    private Evidence evidence;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public CareerActionHistory() {}

    public CareerActionHistory(Student student, String actionId, String actionTitle, String targetSkillName, String status) {
        this.student = student;
        this.actionId = actionId;
        this.actionTitle = actionTitle;
        this.targetSkillName = targetSkillName;
        this.status = status;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public String getActionId() {
        return actionId;
    }

    public void setActionId(String actionId) {
        this.actionId = actionId;
    }

    public String getActionTitle() {
        return actionTitle;
    }

    public void setActionTitle(String actionTitle) {
        this.actionTitle = actionTitle;
    }

    public String getTargetSkillName() {
        return targetSkillName;
    }

    public void setTargetSkillName(String targetSkillName) {
        this.targetSkillName = targetSkillName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Evidence getEvidence() {
        return evidence;
    }

    public void setEvidence(Evidence evidence) {
        this.evidence = evidence;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
