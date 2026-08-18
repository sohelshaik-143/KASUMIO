package com.kasumio.organization.dto;

import com.kasumio.organization.OrganizationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateOrganizationRequest {

    @NotBlank(message = "Organization name is required")
    @Size(max = 255, message = "Organization name cannot exceed 255 characters")
    private String name;

    @NotNull(message = "Organization type is required (COMPANY or COLLEGE)")
    private OrganizationType type;

    private String website;

    public CreateOrganizationRequest() {}

    public CreateOrganizationRequest(String name, OrganizationType type, String website) {
        this.name = name;
        this.type = type;
        this.website = website;
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
}
