package com.kasumio.evidence;

import com.kasumio.opportunity.Opportunity;
import com.kasumio.student.Student;
import com.kasumio.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    name = "verification_requests",
    uniqueConstraints = @UniqueConstraint(columnNames = {"opportunity_id", "evidence_id", "recruiter_id"})
)
public class VerificationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evidence_id", nullable = false)
    private Evidence evidence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private VerificationStatus status = VerificationStatus.REQUESTED;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt = Instant.now();

    @Column(name = "responded_at")
    private Instant respondedAt;

    @Column(name = "recruiter_comment", columnDefinition = "TEXT")
    private String recruiterComment;

    public VerificationRequest() {}

    public VerificationRequest(Opportunity opportunity, Evidence evidence, User recruiter, Student student) {
        this.opportunity = opportunity;
        this.evidence = evidence;
        this.recruiter = recruiter;
        this.student = student;
        this.status = VerificationStatus.REQUESTED;
        this.requestedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Opportunity getOpportunity() {
        return opportunity;
    }

    public void setOpportunity(Opportunity opportunity) {
        this.opportunity = opportunity;
    }

    public Evidence getEvidence() {
        return evidence;
    }

    public void setEvidence(Evidence evidence) {
        this.evidence = evidence;
    }

    public User getRecruiter() {
        return recruiter;
    }

    public void setRecruiter(User recruiter) {
        this.recruiter = recruiter;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(VerificationStatus status) {
        this.status = status;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(Instant requestedAt) {
        this.requestedAt = requestedAt;
    }

    public Instant getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(Instant respondedAt) {
        this.respondedAt = respondedAt;
    }

    public String getRecruiterComment() {
        return recruiterComment;
    }

    public void setRecruiterComment(String recruiterComment) {
        this.recruiterComment = recruiterComment;
    }
}
