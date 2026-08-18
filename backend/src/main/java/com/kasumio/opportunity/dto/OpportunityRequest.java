package com.kasumio.opportunity.dto;

import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.WorkType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

public class OpportunityRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Opportunity type is required (JOB, INTERNSHIP, PROJECT)")
    private OpportunityType type;

    private String location;

    @NotNull(message = "Work type is required (REMOTE, HYBRID, ON_SITE)")
    private WorkType workType;

    private List<SkillRequirementDto> skills = new ArrayList<>();

    public OpportunityRequest() {}

    public OpportunityRequest(String title, String description, OpportunityType type, String location, WorkType workType, List<SkillRequirementDto> skills) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.location = location;
        this.workType = workType;
        this.skills = skills != null ? skills : new ArrayList<>();
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

    public OpportunityType getType() {
        return type;
    }

    public void setType(OpportunityType type) {
        this.type = type;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public WorkType getWorkType() {
        return workType;
    }

    public void setWorkType(WorkType workType) {
        this.workType = workType;
    }

    public List<SkillRequirementDto> getSkills() {
        return skills;
    }

    public void setSkills(List<SkillRequirementDto> skills) {
        this.skills = skills;
    }
}
