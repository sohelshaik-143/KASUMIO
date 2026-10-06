package com.kasumio.assessment.dto;

import com.kasumio.assessment.SelfAssessmentLevel;

/**
 * Request payload for starting an assessment attempt with candidate transparency
 * and self-assessed capability baseline.
 */
public class StartAssessmentRequest {

    private SelfAssessmentLevel selfAssessmentLevel = SelfAssessmentLevel.MEDIUM;
    private Boolean acknowledgedTransparency = true;

    public StartAssessmentRequest() {}

    public StartAssessmentRequest(SelfAssessmentLevel selfAssessmentLevel, Boolean acknowledgedTransparency) {
        this.selfAssessmentLevel = selfAssessmentLevel != null ? selfAssessmentLevel : SelfAssessmentLevel.MEDIUM;
        this.acknowledgedTransparency = acknowledgedTransparency != null ? acknowledgedTransparency : true;
    }

    public SelfAssessmentLevel getSelfAssessmentLevel() { return selfAssessmentLevel; }
    public void setSelfAssessmentLevel(SelfAssessmentLevel selfAssessmentLevel) { this.selfAssessmentLevel = selfAssessmentLevel; }

    public Boolean getAcknowledgedTransparency() { return acknowledgedTransparency; }
    public void setAcknowledgedTransparency(Boolean acknowledgedTransparency) { this.acknowledgedTransparency = acknowledgedTransparency; }
}
