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

    // 5 distinct metrics
    private Integer assessmentMarks = 0;
    private String skillProficiency = "FOUNDATIONAL";
    private Double evidenceConfidence = 0.0;
    private Double marketReadiness = 0.0;
    private Double opportunityMatch = 0.0;

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

    public Integer getAssessmentMarks() { return assessmentMarks != null ? assessmentMarks : 0; }
    public void setAssessmentMarks(Integer assessmentMarks) { this.assessmentMarks = assessmentMarks; }
    public String getSkillProficiency() { return skillProficiency != null ? skillProficiency : "FOUNDATIONAL"; }
    public void setSkillProficiency(String skillProficiency) { this.skillProficiency = skillProficiency; }
    public Double getEvidenceConfidence() { return evidenceConfidence != null ? evidenceConfidence : 0.0; }
    public void setEvidenceConfidence(Double evidenceConfidence) { this.evidenceConfidence = evidenceConfidence; }
    public Double getMarketReadiness() { return marketReadiness != null ? marketReadiness : 0.0; }
    public void setMarketReadiness(Double marketReadiness) { this.marketReadiness = marketReadiness; }
    public Double getOpportunityMatch() { return opportunityMatch != null ? opportunityMatch : 0.0; }
    public void setOpportunityMatch(Double opportunityMatch) { this.opportunityMatch = opportunityMatch; }
}
