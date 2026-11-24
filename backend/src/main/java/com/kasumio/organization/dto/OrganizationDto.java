package com.kasumio.organization.dto;

import com.kasumio.organization.OrganizationType;

public class OrganizationDto {
    private Long id;
    private String name;
    private OrganizationType type;
    private String website;
    private String approvalStatus;

    public OrganizationDto() {}

    public OrganizationDto(Long id, String name, OrganizationType type, String website) {
        this(id, name, type, website, "APPROVED");
    }

    public OrganizationDto(Long id, String name, OrganizationType type, String website, String approvalStatus) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.website = website;
        this.approvalStatus = approvalStatus;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public OrganizationType getType() {
        return type;
    }

    public void setType(OrganizationType type) {
        this.type = type;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }
}
