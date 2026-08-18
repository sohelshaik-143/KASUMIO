package com.kasumio.goal.dto;

public class CareerGoalResponse {
    private Long id;
    private Long studentId;
    private String title;
    private String description;
    private String targetRole;

    public CareerGoalResponse() {}

    public CareerGoalResponse(Long id, Long studentId, String title, String description, String targetRole) {
        this.id = id;
        this.studentId = studentId;
        this.title = title;
        this.description = description;
        this.targetRole = targetRole;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
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
