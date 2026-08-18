package com.kasumio.evidence.dto;

import com.kasumio.evidence.EvidenceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

public class EvidenceRequest {

    @NotNull(message = "Skill ID is required")
    private Long skillId;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    private String description;

    @NotBlank(message = "Evidence URL is required")
    @URL(message = "Must be a valid URL")
    @Size(max = 1024, message = "URL cannot exceed 1024 characters")
    private String evidenceUrl;

    @NotNull(message = "Evidence type is required")
    private EvidenceType evidenceType;

    public EvidenceRequest() {}

    public EvidenceRequest(Long skillId, String title, String description, String evidenceUrl, EvidenceType evidenceType) {
        this.skillId = skillId;
        this.title = title;
        this.description = description;
        this.evidenceUrl = evidenceUrl;
        this.evidenceType = evidenceType;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
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

    public String getEvidenceUrl() {
        return evidenceUrl;
    }

    public void setEvidenceUrl(String evidenceUrl) {
        this.evidenceUrl = evidenceUrl;
    }

    public EvidenceType getEvidenceType() {
        return evidenceType;
    }

    public void setEvidenceType(EvidenceType evidenceType) {
        this.evidenceType = evidenceType;
    }
}
