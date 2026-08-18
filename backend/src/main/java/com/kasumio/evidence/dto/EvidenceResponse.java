package com.kasumio.evidence.dto;

import com.kasumio.evidence.EvidenceType;
import java.time.Instant;

public class EvidenceResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long skillId;
    private String skillName;
    private String skillCategory;
    private String title;
    private String description;
    private String evidenceUrl;
    private EvidenceType evidenceType;
    private Instant createdAt;
    private boolean verified;
    private VerificationResponse verification;

    public EvidenceResponse() {}

    public EvidenceResponse(Long id, Long studentId, String studentName, Long skillId, String skillName, String skillCategory,
                            String title, String description, String evidenceUrl, EvidenceType evidenceType,
                            Instant createdAt, boolean verified, VerificationResponse verification) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.skillId = skillId;
        this.skillName = skillName;
        this.skillCategory = skillCategory;
        this.title = title;
        this.description = description;
        this.evidenceUrl = evidenceUrl;
        this.evidenceType = evidenceType;
        this.createdAt = createdAt;
        this.verified = verified;
        this.verification = verification;
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

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getSkillCategory() {
        return skillCategory;
    }

    public void setSkillCategory(String skillCategory) {
        this.skillCategory = skillCategory;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public VerificationResponse getVerification() {
        return verification;
    }

    public void setVerification(VerificationResponse verification) {
        this.verification = verification;
    }
}
