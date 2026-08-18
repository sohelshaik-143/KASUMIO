package com.kasumio.opportunity.dto;

import com.kasumio.connection.ConnectionStatus;
import com.kasumio.opportunity.InterestStatus;
import java.util.ArrayList;
import java.util.List;

public class CandidateMatchResponse {

    private String candidateAlias;
    private List<CandidateSkillMatchDto> requiredSkills = new ArrayList<>();
    private List<CandidateSkillMatchDto> preferredSkills = new ArrayList<>();
    private String whySurfaced;
    private boolean hasExpressedInterest;
    private InterestStatus interestStatus;
    private ConnectionStatus connectionStatus;
    private Long connectionId;

    public CandidateMatchResponse() {}

    public CandidateMatchResponse(String candidateAlias, List<CandidateSkillMatchDto> requiredSkills,
                                  List<CandidateSkillMatchDto> preferredSkills, String whySurfaced,
                                  boolean hasExpressedInterest, InterestStatus interestStatus) {
        this.candidateAlias = candidateAlias;
        this.requiredSkills = requiredSkills != null ? requiredSkills : new ArrayList<>();
        this.preferredSkills = preferredSkills != null ? preferredSkills : new ArrayList<>();
        this.whySurfaced = whySurfaced;
        this.hasExpressedInterest = hasExpressedInterest;
        this.interestStatus = interestStatus;
    }

    public CandidateMatchResponse(String candidateAlias, List<CandidateSkillMatchDto> requiredSkills,
                                  List<CandidateSkillMatchDto> preferredSkills, String whySurfaced,
                                  boolean hasExpressedInterest, InterestStatus interestStatus,
                                  ConnectionStatus connectionStatus, Long connectionId) {
        this.candidateAlias = candidateAlias;
        this.requiredSkills = requiredSkills != null ? requiredSkills : new ArrayList<>();
        this.preferredSkills = preferredSkills != null ? preferredSkills : new ArrayList<>();
        this.whySurfaced = whySurfaced;
        this.hasExpressedInterest = hasExpressedInterest;
        this.interestStatus = interestStatus;
        this.connectionStatus = connectionStatus;
        this.connectionId = connectionId;
    }

    public String getCandidateAlias() {
        return candidateAlias;
    }

    public void setCandidateAlias(String candidateAlias) {
        this.candidateAlias = candidateAlias;
    }

    public List<CandidateSkillMatchDto> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<CandidateSkillMatchDto> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public List<CandidateSkillMatchDto> getPreferredSkills() {
        return preferredSkills;
    }

    public void setPreferredSkills(List<CandidateSkillMatchDto> preferredSkills) {
        this.preferredSkills = preferredSkills;
    }

    public String getWhySurfaced() {
        return whySurfaced;
    }

    public void setWhySurfaced(String whySurfaced) {
        this.whySurfaced = whySurfaced;
    }

    public boolean isHasExpressedInterest() {
        return hasExpressedInterest;
    }

    public void setHasExpressedInterest(boolean hasExpressedInterest) {
        this.hasExpressedInterest = hasExpressedInterest;
    }

    public InterestStatus getInterestStatus() {
        return interestStatus;
    }

    public void setInterestStatus(InterestStatus interestStatus) {
        this.interestStatus = interestStatus;
    }

    public ConnectionStatus getConnectionStatus() {
        return connectionStatus;
    }

    public void setConnectionStatus(ConnectionStatus connectionStatus) {
        this.connectionStatus = connectionStatus;
    }

    public Long getConnectionId() {
        return connectionId;
    }

    public void setConnectionId(Long connectionId) {
        this.connectionId = connectionId;
    }
}
