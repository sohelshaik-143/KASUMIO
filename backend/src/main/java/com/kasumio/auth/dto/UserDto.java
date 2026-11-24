package com.kasumio.auth.dto;

import com.kasumio.user.Role;
import java.time.Instant;

public class UserDto {
    private Long id;
    private String email;
    private Role role;
    private Long organizationId;
    private String organizationName;
    private Long studentId;
    private String fullName;
    private String avatarUrl;
    private String status;
    private Instant createdAt;

    public UserDto() {}

    public UserDto(Long id, String email, Role role, Long organizationId, String organizationName, Long studentId, String fullName, Instant createdAt) {
        this(id, email, role, organizationId, organizationName, studentId, fullName, null, "ACTIVE", createdAt);
    }

    public UserDto(Long id, String email, Role role, Long organizationId, String organizationName, Long studentId, String fullName, String status, Instant createdAt) {
        this(id, email, role, organizationId, organizationName, studentId, fullName, null, status, createdAt);
    }

    public UserDto(Long id, String email, Role role, Long organizationId, String organizationName, Long studentId, String fullName, String avatarUrl, String status, Instant createdAt) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.studentId = studentId;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
