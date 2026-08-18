package com.kasumio.connection.dto;

public class DisclosedStudentProfileDto {

    private String fullName;
    private String email;
    private String bio;
    private String university;
    private Integer graduationYear;
    private String customMessage;

    public DisclosedStudentProfileDto() {}

    public DisclosedStudentProfileDto(String fullName, String email, String bio,
                                      String university, Integer graduationYear, String customMessage) {
        this.fullName = fullName;
        this.email = email;
        this.bio = bio;
        this.university = university;
        this.graduationYear = graduationYear;
        this.customMessage = customMessage;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getUniversity() {
        return university;
    }

    public void setUniversity(String university) {
        this.university = university;
    }

    public Integer getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(Integer graduationYear) {
        this.graduationYear = graduationYear;
    }

    public String getCustomMessage() {
        return customMessage;
    }

    public void setCustomMessage(String customMessage) {
        this.customMessage = customMessage;
    }
}
