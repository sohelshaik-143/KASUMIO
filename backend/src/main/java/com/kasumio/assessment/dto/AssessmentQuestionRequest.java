package com.kasumio.assessment.dto;

import com.kasumio.assessment.DifficultyLevel;
import com.kasumio.assessment.QuestionType;
import java.util.List;
import java.util.Map;

public class AssessmentQuestionRequest {
    private QuestionType questionType;
    private DifficultyLevel difficulty = DifficultyLevel.MEDIUM;
    private String skillName;
    private String title;
    private String prompt;
    private Integer points = 10;
    private Integer orderIndex = 0;
    private String rubricJson;
    private Integer timeLimitMinutes;
    private List<String> expectedSkills;
    private String imageUrl;
    private String imageAltText;
    private String imageCaption;
    private List<QuestionBuilderDto.OptionSpec> options;
    private QuestionBuilderDto.CodingProblemSpec codingProblem;

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

    public String getRubricJson() { return rubricJson; }
    public void setRubricJson(String rubricJson) { this.rubricJson = rubricJson; }

    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }

    public List<String> getExpectedSkills() { return expectedSkills; }
    public void setExpectedSkills(List<String> expectedSkills) { this.expectedSkills = expectedSkills; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getImageAltText() { return imageAltText; }
    public void setImageAltText(String imageAltText) { this.imageAltText = imageAltText; }

    public String getImageCaption() { return imageCaption; }
    public void setImageCaption(String imageCaption) { this.imageCaption = imageCaption; }

    public List<QuestionBuilderDto.OptionSpec> getOptions() { return options; }
    public void setOptions(List<QuestionBuilderDto.OptionSpec> options) { this.options = options; }

    public QuestionBuilderDto.CodingProblemSpec getCodingProblem() { return codingProblem; }
    public void setCodingProblem(QuestionBuilderDto.CodingProblemSpec codingProblem) { this.codingProblem = codingProblem; }
}
