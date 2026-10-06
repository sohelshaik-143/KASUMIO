package com.kasumio.assessment.dto;

import com.kasumio.assessment.DifficultyLevel;
import com.kasumio.assessment.QuestionType;

import java.util.List;
import java.util.Map;

public class QuestionDetailDto {
    private Long id;
    private Long assessmentId;
    private QuestionType questionType;
    private DifficultyLevel difficulty;
    private String skillName;
    private String title;
    private String prompt;
    private Integer points;
    private Integer orderIndex;
    private String competencyArea;
    private String validationStatus;
    private List<CandidateOptionDto> options;
    private CandidateCodingProblemDto codingProblem;

    public QuestionDetailDto() {}

    public QuestionDetailDto(Long id, Long assessmentId, QuestionType questionType, DifficultyLevel difficulty,
                             String skillName, String title, String prompt, Integer points, Integer orderIndex,
                             List<CandidateOptionDto> options, CandidateCodingProblemDto codingProblem) {
        this.id = id;
        this.assessmentId = assessmentId;
        this.questionType = questionType;
        this.difficulty = difficulty;
        this.skillName = skillName;
        this.title = title;
        this.prompt = prompt;
        this.points = points;
        this.orderIndex = orderIndex;
        this.options = options;
        this.codingProblem = codingProblem;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }
    public QuestionType getQuestionType() { return questionType; }
    public void setQuestionType(QuestionType questionType) { this.questionType = questionType; }
    public DifficultyLevel getDifficulty() { return difficulty; }
    public void setDifficulty(DifficultyLevel difficulty) { this.difficulty = difficulty; }
    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
    public String getCompetencyArea() { return competencyArea; }
    public void setCompetencyArea(String competencyArea) { this.competencyArea = competencyArea; }
    public String getValidationStatus() { return validationStatus; }
    public void setValidationStatus(String validationStatus) { this.validationStatus = validationStatus; }
    public List<CandidateOptionDto> getOptions() { return options; }
    public void setOptions(List<CandidateOptionDto> options) { this.options = options; }
    public CandidateCodingProblemDto getCodingProblem() { return codingProblem; }
    public void setCodingProblem(CandidateCodingProblemDto codingProblem) { this.codingProblem = codingProblem; }

    public static class CandidateOptionDto {
        private Long id;
        private String optionText;

        public CandidateOptionDto() {}
        public CandidateOptionDto(Long id, String optionText) {
            this.id = id;
            this.optionText = optionText;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getOptionText() { return optionText; }
        public void setOptionText(String optionText) { this.optionText = optionText; }
    }

    public static class CandidateCodingProblemDto {
        private Long id;
        private String problemStatement;
        private Map<String, String> starterCodeByLang;
        private String constraints;
        private List<String> allowedLanguages;
        private Integer timeLimitMs;
        private List<CandidateSampleTestCaseDto> sampleTestCases;

        public CandidateCodingProblemDto() {}
        public CandidateCodingProblemDto(Long id, String problemStatement, Map<String, String> starterCodeByLang,
                                         String constraints, List<String> allowedLanguages, Integer timeLimitMs,
                                         List<CandidateSampleTestCaseDto> sampleTestCases) {
            this.id = id;
            this.problemStatement = problemStatement;
            this.starterCodeByLang = starterCodeByLang;
            this.constraints = constraints;
            this.allowedLanguages = allowedLanguages;
            this.timeLimitMs = timeLimitMs;
            this.sampleTestCases = sampleTestCases;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getProblemStatement() { return problemStatement; }
        public void setProblemStatement(String problemStatement) { this.problemStatement = problemStatement; }
        public Map<String, String> getStarterCodeByLang() { return starterCodeByLang; }
        public void setStarterCodeByLang(Map<String, String> starterCodeByLang) { this.starterCodeByLang = starterCodeByLang; }
        public String getConstraints() { return constraints; }
        public void setConstraints(String constraints) { this.constraints = constraints; }
        public List<String> getAllowedLanguages() { return allowedLanguages; }
        public void setAllowedLanguages(List<String> allowedLanguages) { this.allowedLanguages = allowedLanguages; }
        public Integer getTimeLimitMs() { return timeLimitMs; }
        public void setTimeLimitMs(Integer timeLimitMs) { this.timeLimitMs = timeLimitMs; }
        public List<CandidateSampleTestCaseDto> getSampleTestCases() { return sampleTestCases; }
        public void setSampleTestCases(List<CandidateSampleTestCaseDto> sampleTestCases) { this.sampleTestCases = sampleTestCases; }
    }

    public static class CandidateSampleTestCaseDto {
        private Long id;
        private String inputData;
        private String expectedOutput;
        private String explanation;

        public CandidateSampleTestCaseDto() {}
        public CandidateSampleTestCaseDto(Long id, String inputData, String expectedOutput, String explanation) {
            this.id = id;
            this.inputData = inputData;
            this.expectedOutput = expectedOutput;
            this.explanation = explanation;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getInputData() { return inputData; }
        public void setInputData(String inputData) { this.inputData = inputData; }
        public String getExpectedOutput() { return expectedOutput; }
        public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }
}
