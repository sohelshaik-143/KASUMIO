package com.kasumio.assessment;

import com.kasumio.student.Student;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "assessment_attempts")
public class AssessmentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AttemptStatus status = AttemptStatus.NOT_STARTED;

    @Column(name = "score", nullable = false)
    private Integer score = 0;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "adaptive_difficulty", nullable = false)
    private DifficultyLevel adaptiveDifficulty = DifficultyLevel.MEDIUM;

    @Column(name = "feedback_summary", columnDefinition = "TEXT")
    private String feedbackSummary;

    @Enumerated(EnumType.STRING)
    @Column(name = "self_assessment_level")
    private SelfAssessmentLevel selfAssessmentLevel = SelfAssessmentLevel.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "demonstrated_level")
    private DemonstratedLevel demonstratedLevel = DemonstratedLevel.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "integrity_status", nullable = false)
    private AssessmentIntegrityStatus integrityStatus = AssessmentIntegrityStatus.NORMAL;

    @Column(name = "integrity_signals_json", columnDefinition = "TEXT")
    private String integritySignalsJson;

    @Column(name = "evidence_graph_json", columnDefinition = "TEXT")
    private String evidenceGraphJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "recruiter_decision")
    private RecruiterDecisionType recruiterDecision;

    @Column(name = "recruiter_notes", columnDefinition = "TEXT")
    private String recruiterNotes;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public AssessmentAttempt() {}

    public AssessmentAttempt(Assessment assessment, Student student, Integer maxScore) {
        this.assessment = assessment;
        this.student = student;
        this.status = AttemptStatus.IN_PROGRESS;
        this.score = 0;
        this.maxScore = maxScore != null ? maxScore : 0;
        this.adaptiveDifficulty = DifficultyLevel.MEDIUM;
        this.selfAssessmentLevel = SelfAssessmentLevel.MEDIUM;
        this.demonstratedLevel = DemonstratedLevel.MEDIUM;
        this.integrityStatus = AssessmentIntegrityStatus.NORMAL;
        this.startedAt = Instant.now();
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Assessment getAssessment() { return assessment; }
    public void setAssessment(Assessment assessment) { this.assessment = assessment; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public AttemptStatus getStatus() { return status; }
    public void setStatus(AttemptStatus status) { this.status = status; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public DifficultyLevel getAdaptiveDifficulty() { return adaptiveDifficulty; }
    public void setAdaptiveDifficulty(DifficultyLevel adaptiveDifficulty) { this.adaptiveDifficulty = adaptiveDifficulty; }

    public String getFeedbackSummary() { return feedbackSummary; }
    public void setFeedbackSummary(String feedbackSummary) { this.feedbackSummary = feedbackSummary; }

    public SelfAssessmentLevel getSelfAssessmentLevel() { return selfAssessmentLevel; }
    public void setSelfAssessmentLevel(SelfAssessmentLevel selfAssessmentLevel) { this.selfAssessmentLevel = selfAssessmentLevel; }

    public DemonstratedLevel getDemonstratedLevel() { return demonstratedLevel; }
    public void setDemonstratedLevel(DemonstratedLevel demonstratedLevel) { this.demonstratedLevel = demonstratedLevel; }

    public AssessmentIntegrityStatus getIntegrityStatus() { return integrityStatus; }
    public void setIntegrityStatus(AssessmentIntegrityStatus integrityStatus) { this.integrityStatus = integrityStatus; }

    public String getIntegritySignalsJson() { return integritySignalsJson; }
    public void setIntegritySignalsJson(String integritySignalsJson) { this.integritySignalsJson = integritySignalsJson; }

    public String getEvidenceGraphJson() { return evidenceGraphJson; }
    public void setEvidenceGraphJson(String evidenceGraphJson) { this.evidenceGraphJson = evidenceGraphJson; }

    public RecruiterDecisionType getRecruiterDecision() { return recruiterDecision; }
    public void setRecruiterDecision(RecruiterDecisionType recruiterDecision) { this.recruiterDecision = recruiterDecision; }

    public String getRecruiterNotes() { return recruiterNotes; }
    public void setRecruiterNotes(String recruiterNotes) { this.recruiterNotes = recruiterNotes; }

    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
