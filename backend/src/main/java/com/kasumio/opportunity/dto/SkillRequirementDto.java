package com.kasumio.opportunity.dto;

import com.kasumio.opportunity.SkillRequirementType;
import jakarta.validation.constraints.NotNull;

public class SkillRequirementDto {

    private Long skillId;
    private String skillName;
    private String skillCategory;

    @NotNull(message = "Skill requirement type is required (REQUIRED or PREFERRED)")
    private SkillRequirementType skillType;

    public SkillRequirementDto() {}

    public SkillRequirementDto(Long skillId, SkillRequirementType skillType) {
        this.skillId = skillId;
        this.skillType = skillType;
    }

    public SkillRequirementDto(Long skillId, String skillName, String skillCategory, SkillRequirementType skillType) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.skillCategory = skillCategory;
        this.skillType = skillType;
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
}
