package com.kasumio.student.dto;

public class StudentProfileResponse {
    private Long id;
    private Long userId;
    private String email;
    private String fullName;
    private String bio;
    private String university;
    private Integer graduationYear;

    public StudentProfileResponse() {}

    public StudentProfileResponse(Long id, Long userId, String email, String fullName, String bio, String university, Integer graduationYear) {
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.bio = bio;
        this.university = university;
        this.graduationYear = graduationYear;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
