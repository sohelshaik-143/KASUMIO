package com.kasumio.assessment;

import com.kasumio.student.Student;
import jakarta.persistence.*;
import java.time.Instant;

/**
 * Tracks historical question assignments per candidate to prevent question leakage
 * and ensure fresh equivalent question sets across attempts.
 */
@Entity
@Table(name = "candidate_question_history")
public class CandidateQuestionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private AssessmentQuestion question;

    @Column(name = "attempted_at", nullable = false)
    private Instant attemptedAt = Instant.now();

    public CandidateQuestionHistory() {}

    public CandidateQuestionHistory(Student student, AssessmentQuestion question) {
        this.student = student;
        this.question = question;
        this.attemptedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public AssessmentQuestion getQuestion() { return question; }
    public void setQuestion(AssessmentQuestion question) { this.question = question; }

    public Instant getAttemptedAt() { return attemptedAt; }
    public void setAttemptedAt(Instant attemptedAt) { this.attemptedAt = attemptedAt; }
}
