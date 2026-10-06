package com.kasumio.assessment.dto;

import com.kasumio.assessment.DifficultyLevel;
import com.kasumio.assessment.QuestionType;
import com.kasumio.assessment.SubmissionStatus;
import com.kasumio.assessment.DeterministicEvaluationService;

import java.time.Instant;
import java.util.List;

public class AssessmentResultDto {
    private Long attemptId;
    private Long assessmentId;
    private String assessmentTitle;
    private Long opportunityId;
    private String opportunityTitle;
    private Integer score;
    private Integer maxScore;
    private double percentage;
    private boolean passed;
    private Integer passingScore;
    private String capabilityLevel;
    private String feedbackSummary;
    private String selfAssessmentLevel;
    private String demonstratedLevel;
    private String integrityStatus;
    private String integritySignalsJson;
    private String evidenceGraphJson;
    private String recruiterDecision;
    private String recruiterNotes;
    private Instant completedAt;
    private Long verifiedEvidenceId;
    private List<QuestionResultItemDto> questionResults;

    public AssessmentResultDto() {}

    public AssessmentResultDto(Long attemptId, Long assessmentId, String assessmentTitle, Long opportunityId,
                               String opportunityTitle, Integer score, Integer maxScore, double percentage,
                               boolean passed, Integer passingScore, String capabilityLevel,
                               String feedbackSummary, Instant completedAt, Long verifiedEvidenceId,
                               List<QuestionResultItemDto> questionResults) {
        this.attemptId = attemptId;
        this.assessmentId = assessmentId;
        this.assessmentTitle = assessmentTitle;
        this.opportunityId = opportunityId;
        this.opportunityTitle = opportunityTitle;
        this.score = score;
        this.maxScore = maxScore;
        this.percentage = percentage;
        this.passed = passed;
        this.passingScore = passingScore;
        this.capabilityLevel = capabilityLevel;
        this.feedbackSummary = feedbackSummary;
        this.completedAt = completedAt;
        this.verifiedEvidenceId = verifiedEvidenceId;
        this.questionResults = questionResults;
    }

    public Long getAttemptId() { return attemptId; }
    public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }
    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }
    public String getAssessmentTitle() { return assessmentTitle; }
    public void setAssessmentTitle(String assessmentTitle) { this.assessmentTitle = assessmentTitle; }
    public Long getOpportunityId() { return opportunityId; }
    public void setOpportunityId(Long opportunityId) { this.opportunityId = opportunityId; }
    public String getOpportunityTitle() { return opportunityTitle; }
    public void setOpportunityTitle(String opportunityTitle) { this.opportunityTitle = opportunityTitle; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }
    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }
    public Integer getPassingScore() { return passingScore; }
    public void setPassingScore(Integer passingScore) { this.passingScore = passingScore; }
    public String getCapabilityLevel() { return capabilityLevel; }
    public void setCapabilityLevel(String capabilityLevel) { this.capabilityLevel = capabilityLevel; }
    public String getFeedbackSummary() { return feedbackSummary; }
    public void setFeedbackSummary(String feedbackSummary) { this.feedbackSummary = feedbackSummary; }
    public String getSelfAssessmentLevel() { return selfAssessmentLevel; }
    public void setSelfAssessmentLevel(String selfAssessmentLevel) { this.selfAssessmentLevel = selfAssessmentLevel; }
    public String getDemonstratedLevel() { return demonstratedLevel; }
    public void setDemonstratedLevel(String demonstratedLevel) { this.demonstratedLevel = demonstratedLevel; }
    public String getIntegrityStatus() { return integrityStatus; }
    public void setIntegrityStatus(String integrityStatus) { this.integrityStatus = integrityStatus; }
    public String getIntegritySignalsJson() { return integritySignalsJson; }
    public void setIntegritySignalsJson(String integritySignalsJson) { this.integritySignalsJson = integritySignalsJson; }
    public String getEvidenceGraphJson() { return evidenceGraphJson; }
    public void setEvidenceGraphJson(String evidenceGraphJson) { this.evidenceGraphJson = evidenceGraphJson; }
    public String getRecruiterDecision() { return recruiterDecision; }
    public void setRecruiterDecision(String recruiterDecision) { this.recruiterDecision = recruiterDecision; }
    public String getRecruiterNotes() { return recruiterNotes; }
    public void setRecruiterNotes(String recruiterNotes) { this.recruiterNotes = recruiterNotes; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public Long getVerifiedEvidenceId() { return verifiedEvidenceId; }
    public void setVerifiedEvidenceId(Long verifiedEvidenceId) { this.verifiedEvidenceId = verifiedEvidenceId; }
    public List<QuestionResultItemDto> getQuestionResults() { return questionResults; }
    public void setQuestionResults(List<QuestionResultItemDto> questionResults) { this.questionResults = questionResults; }

    public static class QuestionResultItemDto {
        private Long questionId;
        private String title;
        private QuestionType questionType;
        private DifficultyLevel difficulty;
        private String skillName;
        private Integer pointsEarned;
        private Integer maxPoints;
        private SubmissionStatus status;
        private String language;
        private String submittedCode;
        private Long executionTimeMs;
        private Long memoryUsedKb;
        private Integer testCasesPassed;
        private Integer totalTestCases;
        private DeterministicEvaluationService.CandidateFeedback feedback;
        private String telemetryJson;
        private String codeAnalysisJson;
        private Double similarityScore;

        public QuestionResultItemDto() {}

        public QuestionResultItemDto(Long questionId, String title, QuestionType questionType,
                                     DifficultyLevel difficulty, String skillName, Integer pointsEarned,
                                     Integer maxPoints, SubmissionStatus status, String language,
                                     String submittedCode, Long executionTimeMs, Long memoryUsedKb,
                                     Integer testCasesPassed, Integer totalTestCases,
                                     DeterministicEvaluationService.CandidateFeedback feedback) {
            this.questionId = questionId;
            this.title = title;
            this.questionType = questionType;
            this.difficulty = difficulty;
            this.skillName = skillName;
            this.pointsEarned = pointsEarned;
            this.maxPoints = maxPoints;
            this.status = status;
            this.language = language;
            this.submittedCode = submittedCode;
            this.executionTimeMs = executionTimeMs;
            this.memoryUsedKb = memoryUsedKb;
            this.testCasesPassed = testCasesPassed;
            this.totalTestCases = totalTestCases;
            this.feedback = feedback;
        }

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public QuestionType getQuestionType() { return questionType; }
        public void setQuestionType(QuestionType questionType) { this.questionType = questionType; }
        public DifficultyLevel getDifficulty() { return difficulty; }
        public void setDifficulty(DifficultyLevel difficulty) { this.difficulty = difficulty; }
        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }
        public Integer getPointsEarned() { return pointsEarned; }
        public void setPointsEarned(Integer pointsEarned) { this.pointsEarned = pointsEarned; }
        public Integer getMaxPoints() { return maxPoints; }
        public void setMaxPoints(Integer maxPoints) { this.maxPoints = maxPoints; }
        public SubmissionStatus getStatus() { return status; }
        public void setStatus(SubmissionStatus status) { this.status = status; }
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        public String getSubmittedCode() { return submittedCode; }
        public void setSubmittedCode(String submittedCode) { this.submittedCode = submittedCode; }
        public Long getExecutionTimeMs() { return executionTimeMs; }
        public void setExecutionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; }
        public Long getMemoryUsedKb() { return memoryUsedKb; }
        public void setMemoryUsedKb(Long memoryUsedKb) { this.memoryUsedKb = memoryUsedKb; }
        public Integer getTestCasesPassed() { return testCasesPassed; }
        public void setTestCasesPassed(Integer testCasesPassed) { this.testCasesPassed = testCasesPassed; }
        public Integer getTotalTestCases() { return totalTestCases; }
        public void setTotalTestCases(Integer totalTestCases) { this.totalTestCases = totalTestCases; }
        public DeterministicEvaluationService.CandidateFeedback getFeedback() { return feedback; }
        public void setFeedback(DeterministicEvaluationService.CandidateFeedback feedback) { this.feedback = feedback; }
        public String getTelemetryJson() { return telemetryJson; }
        public void setTelemetryJson(String telemetryJson) { this.telemetryJson = telemetryJson; }
        public String getCodeAnalysisJson() { return codeAnalysisJson; }
        public void setCodeAnalysisJson(String codeAnalysisJson) { this.codeAnalysisJson = codeAnalysisJson; }
        public Double getSimilarityScore() { return similarityScore; }
        public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
    }
}
