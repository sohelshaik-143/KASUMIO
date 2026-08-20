package com.kasumio.action;

import com.kasumio.student.Student;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "career_action_feedback")
public class CareerActionFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "action_id", nullable = false)
    private String actionId;

    @Column(name = "feedback_type", nullable = false)
    private String feedbackType; // HELPFUL, NOT_HELPFUL, ALREADY_KNOW, TOO_DIFFICULT, NOT_RELEVANT, WRONG_GOAL, ALREADY_COMPLETED, NOT_INTERESTED

    @Column(name = "feedback_text")
    private String feedbackText;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public CareerActionFeedback() {}

    public CareerActionFeedback(Student student, String actionId, String feedbackType, String feedbackText) {
        this.student = student;
        this.actionId = actionId;
        this.feedbackType = feedbackType;
        this.feedbackText = feedbackText;
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

    public void setStudent(Student student) {
        this.student = student;
    }

    public String getActionId() {
        return actionId;
    }

    public void setActionId(String actionId) {
        this.actionId = actionId;
    }

    public String getFeedbackType() {
        return feedbackType;
    }

    public void setFeedbackType(String feedbackType) {
        this.feedbackType = feedbackType;
    }

    public String getFeedbackText() {
        return feedbackText;
    }

    public void setFeedbackText(String feedbackText) {
        this.feedbackText = feedbackText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
