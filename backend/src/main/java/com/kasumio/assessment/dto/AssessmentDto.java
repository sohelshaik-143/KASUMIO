package com.kasumio.assessment.dto;

import com.kasumio.assessment.AttemptStatus;
import com.kasumio.assessment.DifficultyLevel;
import com.kasumio.assessment.QuestionType;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public class AssessmentDto {
    private Long id;
    private Long opportunityId;
    private String opportunityTitle;
    private String title;
    private String description;
    private Integer timeLimitMinutes;
    private Integer passingScore;
    private Integer totalQuestions;
    private Integer maxPossibleScore;
    private List<QuestionSummaryDto> questions;

    public AssessmentDto() {}

    public AssessmentDto(Long id, Long opportunityId, String opportunityTitle, String title,
                         String description, Integer timeLimitMinutes, Integer passingScore,
                         Integer totalQuestions, Integer maxPossibleScore, List<QuestionSummaryDto> questions) {
        this.id = id;
        this.opportunityId = opportunityId;
        this.opportunityTitle = opportunityTitle;
        this.title = title;
        this.description = description;
        this.timeLimitMinutes = timeLimitMinutes;
        this.passingScore = passingScore;
        this.totalQuestions = totalQuestions;
        this.maxPossibleScore = maxPossibleScore;
        this.questions = questions;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOpportunityId() { return opportunityId; }
    public void setOpportunityId(Long opportunityId) { this.opportunityId = opportunityId; }
    public String getOpportunityTitle() { return opportunityTitle; }
    public void setOpportunityTitle(String opportunityTitle) { this.opportunityTitle = opportunityTitle; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }
    public Integer getPassingScore() { return passingScore; }
    public void setPassingScore(Integer passingScore) { this.passingScore = passingScore; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }
    public Integer getMaxPossibleScore() { return maxPossibleScore; }
    public void setMaxPossibleScore(Integer maxPossibleScore) { this.maxPossibleScore = maxPossibleScore; }
    public List<QuestionSummaryDto> getQuestions() { return questions; }
    public void setQuestions(List<QuestionSummaryDto> questions) { this.questions = questions; }

    public static class QuestionSummaryDto {
        private Long id;
        private QuestionType questionType;
        private DifficultyLevel difficulty;
        private String skillName;
        private String title;
        private Integer points;

        public QuestionSummaryDto() {}

        public QuestionSummaryDto(Long id, QuestionType questionType, DifficultyLevel difficulty, String skillName, String title, Integer points) {
            this.id = id;
            this.questionType = questionType;
            this.difficulty = difficulty;
            this.skillName = skillName;
            this.title = title;
            this.points = points;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public QuestionType getQuestionType() { return questionType; }
        public void setQuestionType(QuestionType questionType) { this.questionType = questionType; }
        public DifficultyLevel getDifficulty() { return difficulty; }
        public void setDifficulty(DifficultyLevel difficulty) { this.difficulty = difficulty; }
        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public Integer getPoints() { return points; }
        public void setPoints(Integer points) { this.points = points; }
    }
}
