package com.kasumio.goal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CareerGoalRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    private String description;

    @NotBlank(message = "Target role is required")
    @Size(max = 255, message = "Target role cannot exceed 255 characters")
    private String targetRole;

    public CareerGoalRequest() {}

    public CareerGoalRequest(String title, String description, String targetRole) {
        this.title = title;
        this.description = description;
        this.targetRole = targetRole;
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

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }
}
