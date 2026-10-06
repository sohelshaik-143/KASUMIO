package com.kasumio.agent.dto;

import com.kasumio.agent.ApprovalStatus;
import com.kasumio.agent.OutreachStatus;

import java.util.ArrayList;
import java.util.List;

public class CandidateRecommendationDto {
    private Long id;
    private Long studentId;
    private String candidateAlias;
    private int overallScore;
    private int readinessScore;
    private int evidenceStrengthScore;
    private List<String> observedProjects = new ArrayList<>();
    private List<String> verifiedEvidence = new ArrayList<>();
    private List<String> inferredCapabilities = new ArrayList<>();
    private List<String> missingGaps = new ArrayList<>();
    private String whyRecommended;
    private String personalizedMessage;
    private ApprovalStatus approvalStatus;
    private OutreachStatus outreachStatus;
    private String assessmentStatus; // "COMPLETED", "IN_PROGRESS", "ELIGIBLE", "NOT_STARTED"
    private Integer assessmentScore;
    private Integer assessmentMaxScore;

    public CandidateRecommendationDto() {}

    public CandidateRecommendationDto(Long id, String candidateAlias, int overallScore,
                                      int readinessScore, int evidenceStrengthScore,
                                      List<String> observedProjects, List<String> verifiedEvidence,
                                      List<String> inferredCapabilities, List<String> missingGaps,
                                      String whyRecommended, String personalizedMessage,
                                      ApprovalStatus approvalStatus, OutreachStatus outreachStatus) {
        this.id = id;
        this.candidateAlias = candidateAlias;
        this.overallScore = overallScore;
        this.readinessScore = readinessScore;
        this.evidenceStrengthScore = evidenceStrengthScore;
        this.observedProjects = observedProjects != null ? observedProjects : new ArrayList<>();
        this.verifiedEvidence = verifiedEvidence != null ? verifiedEvidence : new ArrayList<>();
        this.inferredCapabilities = inferredCapabilities != null ? inferredCapabilities : new ArrayList<>();
        this.missingGaps = missingGaps != null ? missingGaps : new ArrayList<>();
        this.whyRecommended = whyRecommended;
        this.personalizedMessage = personalizedMessage;
        this.approvalStatus = approvalStatus;
        this.outreachStatus = outreachStatus;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCandidateAlias() { return candidateAlias; }
    public void setCandidateAlias(String candidateAlias) { this.candidateAlias = candidateAlias; }
    public int getOverallScore() { return overallScore; }
    public void setOverallScore(int overallScore) { this.overallScore = overallScore; }
    public int getReadinessScore() { return readinessScore; }
    public void setReadinessScore(int readinessScore) { this.readinessScore = readinessScore; }
    public int getEvidenceStrengthScore() { return evidenceStrengthScore; }
    public void setEvidenceStrengthScore(int evidenceStrengthScore) { this.evidenceStrengthScore = evidenceStrengthScore; }
    public List<String> getObservedProjects() { return observedProjects; }
    public void setObservedProjects(List<String> observedProjects) { this.observedProjects = observedProjects; }
    public List<String> getVerifiedEvidence() { return verifiedEvidence; }
    public void setVerifiedEvidence(List<String> verifiedEvidence) { this.verifiedEvidence = verifiedEvidence; }
    public List<String> getInferredCapabilities() { return inferredCapabilities; }
    public void setInferredCapabilities(List<String> inferredCapabilities) { this.inferredCapabilities = inferredCapabilities; }
    public List<String> getMissingGaps() { return missingGaps; }
    public void setMissingGaps(List<String> missingGaps) { this.missingGaps = missingGaps; }
    public String getWhyRecommended() { return whyRecommended; }
    public void setWhyRecommended(String whyRecommended) { this.whyRecommended = whyRecommended; }
    public String getPersonalizedMessage() { return personalizedMessage; }
    public void setPersonalizedMessage(String personalizedMessage) { this.personalizedMessage = personalizedMessage; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getAssessmentStatus() { return assessmentStatus; }
    public void setAssessmentStatus(String assessmentStatus) { this.assessmentStatus = assessmentStatus; }
    public Integer getAssessmentScore() { return assessmentScore; }
    public void setAssessmentScore(Integer assessmentScore) { this.assessmentScore = assessmentScore; }
    public Integer getAssessmentMaxScore() { return assessmentMaxScore; }
    public void setAssessmentMaxScore(Integer assessmentMaxScore) { this.assessmentMaxScore = assessmentMaxScore; }
    public ApprovalStatus getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(ApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }
    public OutreachStatus getOutreachStatus() { return outreachStatus; }
    public void setOutreachStatus(OutreachStatus outreachStatus) { this.outreachStatus = outreachStatus; }
}
