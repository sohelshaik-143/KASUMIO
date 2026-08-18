package com.kasumio.discovery.dto;

import java.util.List;

public class CareerWhatIfRequest {
    private Long targetSkillId;
    private String targetSkillName;
    private List<Long> additionalSkillIds;

    public CareerWhatIfRequest() {}

    public CareerWhatIfRequest(Long targetSkillId, String targetSkillName, List<Long> additionalSkillIds) {
        this.targetSkillId = targetSkillId;
        this.targetSkillName = targetSkillName;
        this.additionalSkillIds = additionalSkillIds;
    }

    public Long getTargetSkillId() { return targetSkillId; }
    public void setTargetSkillId(Long targetSkillId) { this.targetSkillId = targetSkillId; }

    public String getTargetSkillName() { return targetSkillName; }
    public void setTargetSkillName(String targetSkillName) { this.targetSkillName = targetSkillName; }

    public List<Long> getAdditionalSkillIds() { return additionalSkillIds; }
    public void setAdditionalSkillIds(List<Long> additionalSkillIds) { this.additionalSkillIds = additionalSkillIds; }
}
