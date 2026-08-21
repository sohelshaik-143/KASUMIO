package com.kasumio.action.dto;

import java.time.LocalDateTime;

public class CapabilityTransitionDto {
    private String skillName;
    private String category;
    private String beforeLevel; // UNKNOWN, INSUFFICIENT_EVIDENCE, WEAK, MODERATE, STRONG, VERIFIED
    private String afterLevel;  // UNKNOWN, INSUFFICIENT_EVIDENCE, WEAK, MODERATE, STRONG, VERIFIED
    private double beforeConfidence;
    private double afterConfidence;
    private String evidenceTitle;
    private String evidenceUrl;
    private boolean isVerified;
    private String verifierOrganization;
    private String ruleApplied;
    private String explanation;
    private LocalDateTime updatedAt;

    public CapabilityTransitionDto() {}

    public CapabilityTransitionDto(
            String skillName,
            String category,
            String beforeLevel,
            String afterLevel,
            double beforeConfidence,
            double afterConfidence,
            String evidenceTitle,
            String evidenceUrl,
            boolean isVerified,
            String verifierOrganization,
            String ruleApplied,
            String explanation,
            LocalDateTime updatedAt) {
        this.skillName = skillName;
        this.category = category;
        this.beforeLevel = beforeLevel;
        this.afterLevel = afterLevel;
        this.beforeConfidence = beforeConfidence;
        this.afterConfidence = afterConfidence;
        this.evidenceTitle = evidenceTitle;
        this.evidenceUrl = evidenceUrl;
        this.isVerified = isVerified;
        this.verifierOrganization = verifierOrganization;
        this.ruleApplied = ruleApplied;
        this.explanation = explanation;
        this.updatedAt = updatedAt;
    }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBeforeLevel() { return beforeLevel; }
    public void setBeforeLevel(String beforeLevel) { this.beforeLevel = beforeLevel; }

    public String getAfterLevel() { return afterLevel; }
    public void setAfterLevel(String afterLevel) { this.afterLevel = afterLevel; }

    public double getBeforeConfidence() { return beforeConfidence; }
    public void setBeforeConfidence(double beforeConfidence) { this.beforeConfidence = beforeConfidence; }

    public double getAfterConfidence() { return afterConfidence; }
    public void setAfterConfidence(double afterConfidence) { this.afterConfidence = afterConfidence; }

    public String getEvidenceTitle() { return evidenceTitle; }
    public void setEvidenceTitle(String evidenceTitle) { this.evidenceTitle = evidenceTitle; }

    public String getEvidenceUrl() { return evidenceUrl; }
    public void setEvidenceUrl(String evidenceUrl) { this.evidenceUrl = evidenceUrl; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }

    public String getVerifierOrganization() { return verifierOrganization; }
    public void setVerifierOrganization(String verifierOrganization) { this.verifierOrganization = verifierOrganization; }

    public String getRuleApplied() { return ruleApplied; }
    public void setRuleApplied(String ruleApplied) { this.ruleApplied = ruleApplied; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
