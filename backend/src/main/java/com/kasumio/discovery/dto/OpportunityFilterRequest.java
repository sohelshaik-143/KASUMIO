package com.kasumio.discovery.dto;

import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.WorkType;

import java.util.List;

public class OpportunityFilterRequest {
    private String query; // Natural language or keyword
    private OpportunityType type;
    private WorkType workType;
    private String location;
    private List<String> technologies;
    private String category;
    private String matchStrength; // STRONG, POTENTIAL, STRETCH, ALL
    private String deadlineFilter; // CLOSING_SOON, CLOSING_TODAY, ALL
    private String sortBy; // MATCH_SCORE, DEADLINE, RECENT, TITLE

    public OpportunityFilterRequest() {}

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public OpportunityType getType() { return type; }
    public void setType(OpportunityType type) { this.type = type; }
    public WorkType getWorkType() { return workType; }
    public void setWorkType(WorkType workType) { this.workType = workType; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public List<String> getTechnologies() { return technologies; }
    public void setTechnologies(List<String> technologies) { this.technologies = technologies; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getMatchStrength() { return matchStrength; }
    public void setMatchStrength(String matchStrength) { this.matchStrength = matchStrength; }
    public String getDeadlineFilter() { return deadlineFilter; }
    public void setDeadlineFilter(String deadlineFilter) { this.deadlineFilter = deadlineFilter; }
    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
}
