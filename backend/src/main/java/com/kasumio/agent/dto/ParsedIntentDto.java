package com.kasumio.agent.dto;

import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.WorkType;

import java.util.ArrayList;
import java.util.List;

public class ParsedIntentDto {
    private String roleTitle;
    private OpportunityType opportunityType;
    private WorkType workType;
    private String location;
    private List<String> requiredSkills = new ArrayList<>();
    private List<String> preferredSkills = new ArrayList<>();
    private String domainEcosystem;
    private String generatedDescription;
    private String generatedResponsibilities;
    private String generatedEligibility;

    public ParsedIntentDto() {}

    public ParsedIntentDto(String roleTitle, OpportunityType opportunityType, WorkType workType,
                           String location, List<String> requiredSkills, List<String> preferredSkills,
                           String domainEcosystem, String generatedDescription,
                           String generatedResponsibilities, String generatedEligibility) {
        this.roleTitle = roleTitle;
        this.opportunityType = opportunityType;
        this.workType = workType;
        this.location = location;
        this.requiredSkills = requiredSkills != null ? requiredSkills : new ArrayList<>();
        this.preferredSkills = preferredSkills != null ? preferredSkills : new ArrayList<>();
        this.domainEcosystem = domainEcosystem;
        this.generatedDescription = generatedDescription;
        this.generatedResponsibilities = generatedResponsibilities;
        this.generatedEligibility = generatedEligibility;
    }

    public String getRoleTitle() { return roleTitle; }
    public void setRoleTitle(String roleTitle) { this.roleTitle = roleTitle; }
    public OpportunityType getOpportunityType() { return opportunityType; }
    public void setOpportunityType(OpportunityType opportunityType) { this.opportunityType = opportunityType; }
    public WorkType getWorkType() { return workType; }
    public void setWorkType(WorkType workType) { this.workType = workType; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public List<String> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }
    public List<String> getPreferredSkills() { return preferredSkills; }
    public void setPreferredSkills(List<String> preferredSkills) { this.preferredSkills = preferredSkills; }
    public String getDomainEcosystem() { return domainEcosystem; }
    public void setDomainEcosystem(String domainEcosystem) { this.domainEcosystem = domainEcosystem; }
    public String getGeneratedDescription() { return generatedDescription; }
    public void setGeneratedDescription(String generatedDescription) { this.generatedDescription = generatedDescription; }
    public String getGeneratedResponsibilities() { return generatedResponsibilities; }
    public void setGeneratedResponsibilities(String generatedResponsibilities) { this.generatedResponsibilities = generatedResponsibilities; }
    public String getGeneratedEligibility() { return generatedEligibility; }
    public void setGeneratedEligibility(String generatedEligibility) { this.generatedEligibility = generatedEligibility; }
}
