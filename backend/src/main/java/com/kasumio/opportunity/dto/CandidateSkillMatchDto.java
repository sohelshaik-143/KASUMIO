package com.kasumio.opportunity.dto;

import com.kasumio.opportunity.EvidenceLevel;

public class CandidateSkillMatchDto {

    private String skill;
    private EvidenceLevel status;
    private boolean verified;
    private boolean recent;
    private boolean multiple;

    public CandidateSkillMatchDto() {}

    public CandidateSkillMatchDto(String skill, EvidenceLevel status, boolean verified, boolean recent, boolean multiple) {
        this.skill = skill;
        this.status = status;
        this.verified = verified;
        this.recent = recent;
        this.multiple = multiple;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public EvidenceLevel getStatus() {
        return status;
    }

    public void setStatus(EvidenceLevel status) {
        this.status = status;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public boolean isRecent() {
        return recent;
    }

    public void setRecent(boolean recent) {
        this.recent = recent;
    }

    public boolean isMultiple() {
        return multiple;
    }

    public void setMultiple(boolean multiple) {
        this.multiple = multiple;
    }
}
