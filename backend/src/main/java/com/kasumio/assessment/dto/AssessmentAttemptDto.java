package com.kasumio.assessment.dto;

import com.kasumio.assessment.AttemptStatus;
import com.kasumio.assessment.DifficultyLevel;

import java.time.Instant;

public class AssessmentAttemptDto {
    private Long id;
    private Long assessmentId;
    private String assessmentTitle;
    private Long opportunityId;
    private String opportunityTitle;
    private Long studentId;
    private String studentName;
    private AttemptStatus status;
    private Integer score;
    private Integer maxScore;
    private DifficultyLevel adaptiveDifficulty;
    private Integer timeLimitMinutes;
    private String selfAssessmentLevel;
    private String demonstratedLevel;
    private String integrityStatus;
    private Instant startedAt;
    private Instant completedAt;

    public AssessmentAttemptDto() {}

    public AssessmentAttemptDto(Long id, Long assessmentId, String assessmentTitle, Long opportunityId,
                                String opportunityTitle, Long studentId, String studentName,
                                AttemptStatus status, Integer score, Integer maxScore,
                                DifficultyLevel adaptiveDifficulty, Integer timeLimitMinutes,
                                Instant startedAt, Instant completedAt) {
        this.id = id;
        this.assessmentId = assessmentId;
        this.assessmentTitle = assessmentTitle;
        this.opportunityId = opportunityId;
        this.opportunityTitle = opportunityTitle;
        this.studentId = studentId;
        this.studentName = studentName;
        this.status = status;
        this.score = score;
        this.maxScore = maxScore;
        this.adaptiveDifficulty = adaptiveDifficulty;
        this.timeLimitMinutes = timeLimitMinutes;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }
    public String getAssessmentTitle() { return assessmentTitle; }
    public void setAssessmentTitle(String assessmentTitle) { this.assessmentTitle = assessmentTitle; }
    public Long getOpportunityId() { return opportunityId; }
    public void setOpportunityId(Long opportunityId) { this.opportunityId = opportunityId; }
    public String getOpportunityTitle() { return opportunityTitle; }
    public void setOpportunityTitle(String opportunityTitle) { this.opportunityTitle = opportunityTitle; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public AttemptStatus getStatus() { return status; }
    public void setStatus(AttemptStatus status) { this.status = status; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }
    public DifficultyLevel getAdaptiveDifficulty() { return adaptiveDifficulty; }
    public void setAdaptiveDifficulty(DifficultyLevel adaptiveDifficulty) { this.adaptiveDifficulty = adaptiveDifficulty; }
    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }
    public String getSelfAssessmentLevel() { return selfAssessmentLevel; }
    public void setSelfAssessmentLevel(String selfAssessmentLevel) { this.selfAssessmentLevel = selfAssessmentLevel; }
    public String getDemonstratedLevel() { return demonstratedLevel; }
    public void setDemonstratedLevel(String demonstratedLevel) { this.demonstratedLevel = demonstratedLevel; }
    public String getIntegrityStatus() { return integrityStatus; }
    public void setIntegrityStatus(String integrityStatus) { this.integrityStatus = integrityStatus; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}
