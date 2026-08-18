package com.kasumio.evidence.dto;

import com.kasumio.evidence.EvidenceType;

public class EvidenceTemplateResponse {
    private Long id;
    private String title;
    private String description;
    private EvidenceType evidenceType;
    private String suggestedFields;

    public EvidenceTemplateResponse() {}

    public EvidenceTemplateResponse(Long id, String title, String description, EvidenceType evidenceType, String suggestedFields) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.evidenceType = evidenceType;
        this.suggestedFields = suggestedFields;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public EvidenceType getEvidenceType() {
        return evidenceType;
    }

    public void setEvidenceType(EvidenceType evidenceType) {
        this.evidenceType = evidenceType;
    }

    public String getSuggestedFields() {
        return suggestedFields;
    }

    public void setSuggestedFields(String suggestedFields) {
        this.suggestedFields = suggestedFields;
    }
}
