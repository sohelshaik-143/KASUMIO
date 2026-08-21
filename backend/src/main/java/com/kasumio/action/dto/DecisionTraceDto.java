package com.kasumio.action.dto;

import java.time.LocalDateTime;

public class DecisionTraceDto {
    private Long id;
    private String traceType;
    private String targetSkillName;
    private String beforeState;
    private String afterState;
    private Long evidenceId;
    private String evidenceTitle;
    private Long verificationId;
    private String actionId;
    private int opportunityImpactCount;
    private String ruleApplied;
    private String explanation;
    private LocalDateTime createdAt;

    public DecisionTraceDto() {}

    public DecisionTraceDto(
            Long id,
            String traceType,
            String targetSkillName,
            String beforeState,
            String afterState,
            Long evidenceId,
            String evidenceTitle,
            Long verificationId,
            String actionId,
            int opportunityImpactCount,
            String ruleApplied,
            String explanation,
            LocalDateTime createdAt) {
        this.id = id;
        this.traceType = traceType;
        this.targetSkillName = targetSkillName;
        this.beforeState = beforeState;
        this.afterState = afterState;
        this.evidenceId = evidenceId;
        this.evidenceTitle = evidenceTitle;
        this.verificationId = verificationId;
        this.actionId = actionId;
        this.opportunityImpactCount = opportunityImpactCount;
        this.ruleApplied = ruleApplied;
        this.explanation = explanation;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getTraceType() { return traceType; }
    public String getTargetSkillName() { return targetSkillName; }
    public String getBeforeState() { return beforeState; }
    public String getAfterState() { return afterState; }
    public Long getEvidenceId() { return evidenceId; }
    public String getEvidenceTitle() { return evidenceTitle; }
    public Long getVerificationId() { return verificationId; }
    public String getActionId() { return actionId; }
    public int getOpportunityImpactCount() { return opportunityImpactCount; }
    public String getRuleApplied() { return ruleApplied; }
    public String getExplanation() { return explanation; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
