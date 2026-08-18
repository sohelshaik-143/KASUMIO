package com.kasumio.auth.dto;

import com.kasumio.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    private Role role; // Optional, defaults to STUDENT if null

    private String fullName; // Used to pre-populate Student profile if role == STUDENT

    private Long organizationId; // Optional, for recruiters linking to an organization ID
    private String organizationName; // Optional, for recruiters typing their company name

    public RegisterRequest() {}

    public RegisterRequest(String email, String password, Role role, String fullName, Long organizationId) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.fullName = fullName;
        this.organizationId = organizationId;
    }

    public RegisterRequest(String email, String password, Role role, String fullName, Long organizationId, String organizationName) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.fullName = fullName;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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
}
