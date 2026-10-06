package com.kasumio.assessment.dto;

import com.kasumio.assessment.RecruiterDecisionType;

/**
 * Payload for recruiter evaluation action on a candidate technical verification.
 */
public class RecruiterDecisionRequest {

    private RecruiterDecisionType decision;
    private String notes;

    public RecruiterDecisionRequest() {}

    public RecruiterDecisionRequest(RecruiterDecisionType decision, String notes) {
        this.decision = decision;
        this.notes = notes;
    }

    public RecruiterDecisionType getDecision() { return decision; }
    public void setDecision(RecruiterDecisionType decision) { this.decision = decision; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
