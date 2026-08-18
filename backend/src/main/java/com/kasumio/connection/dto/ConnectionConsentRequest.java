package com.kasumio.connection.dto;

public class ConnectionConsentRequest {

    private boolean shareFullName = false;
    private boolean shareEmail = false;
    private boolean shareBio = false;
    private boolean shareUniversity = false;
    private boolean shareGraduationYear = false;
    private String customMessage;

    public ConnectionConsentRequest() {}

    public ConnectionConsentRequest(boolean shareFullName, boolean shareEmail, boolean shareBio,
                                    boolean shareUniversity, boolean shareGraduationYear, String customMessage) {
        this.shareFullName = shareFullName;
        this.shareEmail = shareEmail;
        this.shareBio = shareBio;
        this.shareUniversity = shareUniversity;
        this.shareGraduationYear = shareGraduationYear;
        this.customMessage = customMessage;
    }

    public boolean isShareFullName() {
        return shareFullName;
    }

    public void setShareFullName(boolean shareFullName) {
        this.shareFullName = shareFullName;
    }

    public boolean isShareEmail() {
        return shareEmail;
    }

    public void setShareEmail(boolean shareEmail) {
        this.shareEmail = shareEmail;
    }

    public boolean isShareBio() {
        return shareBio;
    }

    public void setShareBio(boolean shareBio) {
        this.shareBio = shareBio;
    }

    public boolean isShareUniversity() {
        return shareUniversity;
    }

    public void setShareUniversity(boolean shareUniversity) {
        this.shareUniversity = shareUniversity;
    }

    public boolean isShareGraduationYear() {
        return shareGraduationYear;
    }

    public void setShareGraduationYear(boolean shareGraduationYear) {
        this.shareGraduationYear = shareGraduationYear;
    }

    public String getCustomMessage() {
        return customMessage;
    }

    public void setCustomMessage(String customMessage) {
        this.customMessage = customMessage;
    }
}
