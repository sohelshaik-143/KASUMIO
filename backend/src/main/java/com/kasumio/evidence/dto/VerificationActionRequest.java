package com.kasumio.evidence.dto;

public class VerificationActionRequest {

    private String comment;

    public VerificationActionRequest() {}

    public VerificationActionRequest(String comment) {
        this.comment = comment;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
