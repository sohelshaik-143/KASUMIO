package com.kasumio.discovery.dto;

import com.kasumio.opportunity.EvidenceLevel;
import com.kasumio.opportunity.SkillRequirementType;

public class TechnologySkillEvaluationDto {
    private Long skillId;
    private String skillName;
    private String category;
    private String subcategory;
    private String ecosystem;
    private SkillRequirementType requirementType;
    private String matchStatus; // MATCHED, PARTIAL, MISSING
    private EvidenceLevel evidenceLevel;
    private int evidenceCount;
    private boolean isVerified;
    private String explanation;

    public TechnologySkillEvaluationDto() {}

    public TechnologySkillEvaluationDto(
            Long skillId, String skillName, String category, String subcategory,
            String ecosystem, SkillRequirementType requirementType, String matchStatus,
            EvidenceLevel evidenceLevel, int evidenceCount, boolean isVerified, String explanation) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.category = category;
        this.subcategory = subcategory;
        this.ecosystem = ecosystem;
        this.requirementType = requirementType;
        this.matchStatus = matchStatus;
        this.evidenceLevel = evidenceLevel;
        this.evidenceCount = evidenceCount;
        this.isVerified = isVerified;
        this.explanation = explanation;
    }

    public Long getSkillId() { return skillId; }
    public String getSkillName() { return skillName; }
    public String getCategory() { return category; }
    public String getSubcategory() { return subcategory; }
    public String getEcosystem() { return ecosystem; }
    public SkillRequirementType getRequirementType() { return requirementType; }
    public String getMatchStatus() { return matchStatus; }
    public EvidenceLevel getEvidenceLevel() { return evidenceLevel; }
    public int getEvidenceCount() { return evidenceCount; }
    public boolean isVerified() { return isVerified; }
    public String getExplanation() { return explanation; }
}
