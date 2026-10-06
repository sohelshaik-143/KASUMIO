package com.kasumio.assessment;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "question_submissions")
public class QuestionSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private AssessmentAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private AssessmentQuestion question;

    @Column(name = "language")
    private String language;

    @Column(name = "submitted_code", columnDefinition = "TEXT")
    private String submittedCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private QuestionOption selectedOption;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SubmissionStatus status = SubmissionStatus.PASSED;

    @Column(name = "execution_time_ms", nullable = false)
    private Long executionTimeMs = 0L;

    @Column(name = "memory_used_kb", nullable = false)
    private Long memoryUsedKb = 0L;

    @Column(name = "test_cases_passed", nullable = false)
    private Integer testCasesPassed = 0;

    @Column(name = "total_test_cases", nullable = false)
    private Integer totalTestCases = 0;

    @Column(name = "feedback_json", columnDefinition = "TEXT")
    private String feedbackJson;

    @Column(name = "telemetry_json", columnDefinition = "TEXT")
    private String telemetryJson;

    @Column(name = "code_analysis_json", columnDefinition = "TEXT")
    private String codeAnalysisJson;

    @Column(name = "similarity_score")
    private Double similarityScore = 0.0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public QuestionSubmission() {}

    public QuestionSubmission(AssessmentAttempt attempt, AssessmentQuestion question, String language,
                              String submittedCode, QuestionOption selectedOption, SubmissionStatus status,
                              Long executionTimeMs, Long memoryUsedKb, Integer testCasesPassed,
                              Integer totalTestCases, String feedbackJson) {
        this.attempt = attempt;
        this.question = question;
        this.language = language;
        this.submittedCode = submittedCode;
        this.selectedOption = selectedOption;
        this.status = status != null ? status : SubmissionStatus.PASSED;
        this.executionTimeMs = executionTimeMs != null ? executionTimeMs : 0L;
        this.memoryUsedKb = memoryUsedKb != null ? memoryUsedKb : 0L;
        this.testCasesPassed = testCasesPassed != null ? testCasesPassed : 0;
        this.totalTestCases = totalTestCases != null ? totalTestCases : 0;
        this.feedbackJson = feedbackJson;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AssessmentAttempt getAttempt() { return attempt; }
    public void setAttempt(AssessmentAttempt attempt) { this.attempt = attempt; }

    public AssessmentQuestion getQuestion() { return question; }
    public void setQuestion(AssessmentQuestion question) { this.question = question; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getSubmittedCode() { return submittedCode; }
    public void setSubmittedCode(String submittedCode) { this.submittedCode = submittedCode; }

    public QuestionOption getSelectedOption() { return selectedOption; }
    public void setSelectedOption(QuestionOption selectedOption) { this.selectedOption = selectedOption; }

    public SubmissionStatus getStatus() { return status; }
    public void setStatus(SubmissionStatus status) { this.status = status; }

    public Long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public Long getMemoryUsedKb() { return memoryUsedKb; }
    public void setMemoryUsedKb(Long memoryUsedKb) { this.memoryUsedKb = memoryUsedKb; }

    public Integer getTestCasesPassed() { return testCasesPassed; }
    public void setTestCasesPassed(Integer testCasesPassed) { this.testCasesPassed = testCasesPassed; }

    public Integer getTotalTestCases() { return totalTestCases; }
    public void setTotalTestCases(Integer totalTestCases) { this.totalTestCases = totalTestCases; }

    public String getFeedbackJson() { return feedbackJson; }
    public void setFeedbackJson(String feedbackJson) { this.feedbackJson = feedbackJson; }

    public String getTelemetryJson() { return telemetryJson; }
    public void setTelemetryJson(String telemetryJson) { this.telemetryJson = telemetryJson; }

    public String getCodeAnalysisJson() { return codeAnalysisJson; }
    public void setCodeAnalysisJson(String codeAnalysisJson) { this.codeAnalysisJson = codeAnalysisJson; }

    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
