package com.kasumio.opportunity.dto;

import com.kasumio.opportunity.EvidenceLevel;
import com.kasumio.opportunity.SkillRequirementType;

public class StudentSkillEvaluationDto {

    private Long skillId;
    private String skillName;
    private String skillCategory;
    private SkillRequirementType skillType;
    private boolean demonstrated;
    private int evidenceCount;
    private boolean verified;
    private EvidenceLevel status;

    public StudentSkillEvaluationDto() {}

    public StudentSkillEvaluationDto(Long skillId, String skillName, String skillCategory, SkillRequirementType skillType,
                                     boolean demonstrated, int evidenceCount, boolean verified, EvidenceLevel status) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.skillCategory = skillCategory;
        this.skillType = skillType;
        this.demonstrated = demonstrated;
        this.evidenceCount = evidenceCount;
        this.verified = verified;
        this.status = status;
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

    public SkillRequirementType getSkillType() {
        return skillType;
    }

    public void setSkillType(SkillRequirementType skillType) {
        this.skillType = skillType;
    }

    public boolean isDemonstrated() {
        return demonstrated;
    }

    public void setDemonstrated(boolean demonstrated) {
        this.demonstrated = demonstrated;
    }

    public int getEvidenceCount() {
        return evidenceCount;
    }

    public void setEvidenceCount(int evidenceCount) {
        this.evidenceCount = evidenceCount;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public EvidenceLevel getStatus() {
        return status;
    }

    public void setStatus(EvidenceLevel status) {
        this.status = status;
    }
}
