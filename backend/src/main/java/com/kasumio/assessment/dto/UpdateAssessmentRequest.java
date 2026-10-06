package com.kasumio.assessment.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request to customize an opportunity's technical screening blueprint")
public class UpdateAssessmentRequest {

    @Schema(description = "Custom title for technical screening", example = "Backend Java & Cloud Screening")
    private String title;

    @Schema(description = "Description or instructions for candidates", example = "45-minute technical evaluation covering algorithms, Spring Boot, and SQL queries.")
    private String description;

    @Schema(description = "Assessment time limit in minutes", example = "45")
    private Integer timeLimitMinutes;

    @Schema(description = "Passing score percentage threshold (0-100)", example = "70")
    private Integer passingScore;

    public UpdateAssessmentRequest() {}

    public UpdateAssessmentRequest(String title, String description, Integer timeLimitMinutes, Integer passingScore) {
        this.title = title;
        this.description = description;
        this.timeLimitMinutes = timeLimitMinutes;
        this.passingScore = passingScore;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTimeLimitMinutes() {
        return timeLimitMinutes;
    }

    public void setTimeLimitMinutes(Integer timeLimitMinutes) {
        this.timeLimitMinutes = timeLimitMinutes;
    }

    public Integer getPassingScore() {
        return passingScore;
    }

    public void setPassingScore(Integer passingScore) {
        this.passingScore = passingScore;
    }
}
