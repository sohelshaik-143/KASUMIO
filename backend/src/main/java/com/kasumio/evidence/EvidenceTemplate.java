package com.kasumio.evidence;

import jakarta.persistence.*;

@Entity
@Table(name = "evidence_templates")
public class EvidenceTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "evidence_type", nullable = false, length = 50)
    private EvidenceType evidenceType;

    @Column(name = "suggested_fields", columnDefinition = "JSON")
    private String suggestedFields;

    public EvidenceTemplate() {}

    public EvidenceTemplate(Long id, String title, String description, EvidenceType evidenceType, String suggestedFields) {
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
