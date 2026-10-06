package com.kasumio.agent;

import com.kasumio.student.Student;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "recruiter_candidate_recommendations")
public class CandidateRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", referencedColumnName = "job_id", nullable = false)
    private RecruiterAutomationJob job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "candidate_alias", nullable = false, length = 50)
    private String candidateAlias;

    @Column(name = "overall_score", nullable = false)
    private int overallScore;

    @Column(name = "readiness_score", nullable = false)
    private int readinessScore;

    @Column(name = "evidence_strength_score", nullable = false)
    private int evidenceStrengthScore;

    @Column(name = "evidence_breakdown", nullable = false, columnDefinition = "TEXT")
    private String evidenceBreakdown;

    @Column(name = "why_recommended", nullable = false, columnDefinition = "TEXT")
    private String whyRecommended;

    @Column(name = "personalized_message", nullable = false, columnDefinition = "TEXT")
    private String personalizedMessage;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.APPROVED;

    @Enumerated(EnumType.STRING)
    @Column(name = "outreach_status", nullable = false)
    private OutreachStatus outreachStatus = OutreachStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public CandidateRecommendation() {}

    public CandidateRecommendation(RecruiterAutomationJob job, Student student, String candidateAlias,
                                   int overallScore, int readinessScore, int evidenceStrengthScore,
                                   String evidenceBreakdown, String whyRecommended, String personalizedMessage) {
        this.job = job;
        this.student = student;
        this.candidateAlias = candidateAlias;
        this.overallScore = overallScore;
        this.readinessScore = readinessScore;
        this.evidenceStrengthScore = evidenceStrengthScore;
        this.evidenceBreakdown = evidenceBreakdown;
        this.whyRecommended = whyRecommended;
        this.personalizedMessage = personalizedMessage;
        this.approvalStatus = ApprovalStatus.APPROVED;
        this.outreachStatus = OutreachStatus.PENDING;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public RecruiterAutomationJob getJob() { return job; }
    public void setJob(RecruiterAutomationJob job) { this.job = job; }
    public Student getStudent() { return student; }
    public String getCandidateAlias() { return candidateAlias; }
    public int getOverallScore() { return overallScore; }
    public int getReadinessScore() { return readinessScore; }
    public int getEvidenceStrengthScore() { return evidenceStrengthScore; }
    public String getEvidenceBreakdown() { return evidenceBreakdown; }
    public String getWhyRecommended() { return whyRecommended; }
    public String getPersonalizedMessage() { return personalizedMessage; }
    public void setPersonalizedMessage(String personalizedMessage) { this.personalizedMessage = personalizedMessage; }
    public ApprovalStatus getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(ApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }
    public OutreachStatus getOutreachStatus() { return outreachStatus; }
    public void setOutreachStatus(OutreachStatus outreachStatus) { this.outreachStatus = outreachStatus; }
    public Instant getCreatedAt() { return createdAt; }
}
