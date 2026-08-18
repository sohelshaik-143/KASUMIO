package com.kasumio.connection.dto;

public class ConnectionRequestDto {

    private String recruiterNote;

    public ConnectionRequestDto() {}

    public ConnectionRequestDto(String recruiterNote) {
        this.recruiterNote = recruiterNote;
    }

    public String getRecruiterNote() {
        return recruiterNote;
    }

    public void setRecruiterNote(String recruiterNote) {
        this.recruiterNote = recruiterNote;
    }
}
