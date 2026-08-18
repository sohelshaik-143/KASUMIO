package com.kasumio.student.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class StudentProfileRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 255, message = "Full name cannot exceed 255 characters")
    private String fullName;

    private String bio;

    private String university;

    @Min(value = 1970, message = "Graduation year must be a valid 4-digit year")
    @Max(value = 2100, message = "Graduation year must be a valid 4-digit year")
    private Integer graduationYear;

    public StudentProfileRequest() {}

    public StudentProfileRequest(String fullName, String bio, String university, Integer graduationYear) {
        this.fullName = fullName;
        this.bio = bio;
        this.university = university;
        this.graduationYear = graduationYear;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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
}
