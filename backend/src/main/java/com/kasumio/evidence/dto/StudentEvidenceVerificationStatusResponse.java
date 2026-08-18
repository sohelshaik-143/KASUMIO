package com.kasumio.evidence.dto;

import java.util.ArrayList;
import java.util.List;

public class StudentEvidenceVerificationStatusResponse {

    private Long evidenceId;
    private String evidenceTitle;
    private String skillName;
    private String skillCategory;
    private List<OpportunityVerificationItemDto> verifications = new ArrayList<>();

    public StudentEvidenceVerificationStatusResponse() {}

    public StudentEvidenceVerificationStatusResponse(Long evidenceId, String evidenceTitle, String skillName,
                                                    String skillCategory, List<OpportunityVerificationItemDto> verifications) {
        this.evidenceId = evidenceId;
        this.evidenceTitle = evidenceTitle;
        this.skillName = skillName;
        this.skillCategory = skillCategory;
        this.verifications = verifications != null ? verifications : new ArrayList<>();
    }

    public Long getEvidenceId() {
        return evidenceId;
    }

    public void setEvidenceId(Long evidenceId) {
        this.evidenceId = evidenceId;
    }

    public String getEvidenceTitle() {
        return evidenceTitle;
    }

    public void setEvidenceTitle(String evidenceTitle) {
        this.evidenceTitle = evidenceTitle;
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

    public List<OpportunityVerificationItemDto> getVerifications() {
        return verifications;
    }

    public void setVerifications(List<OpportunityVerificationItemDto> verifications) {
        this.verifications = verifications;
    }
}
