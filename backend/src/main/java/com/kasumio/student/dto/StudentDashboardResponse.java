package com.kasumio.student.dto;

public class StudentDashboardResponse {
    private long totalEvidenceCount;
    private long verifiedEvidenceCount;
    private long careerGoalsCount;
    private boolean profileComplete;

    public StudentDashboardResponse() {}

    public StudentDashboardResponse(long totalEvidenceCount, long verifiedEvidenceCount, long careerGoalsCount, boolean profileComplete) {
        this.totalEvidenceCount = totalEvidenceCount;
        this.verifiedEvidenceCount = verifiedEvidenceCount;
        this.careerGoalsCount = careerGoalsCount;
        this.profileComplete = profileComplete;
    }

    public long getTotalEvidenceCount() {
        return totalEvidenceCount;
    }

    public void setTotalEvidenceCount(long totalEvidenceCount) {
        this.totalEvidenceCount = totalEvidenceCount;
    }

    public long getVerifiedEvidenceCount() {
        return verifiedEvidenceCount;
    }

    public void setVerifiedEvidenceCount(long verifiedEvidenceCount) {
        this.verifiedEvidenceCount = verifiedEvidenceCount;
    }

    public long getCareerGoalsCount() {
        return careerGoalsCount;
    }

    public void setCareerGoalsCount(long careerGoalsCount) {
        this.careerGoalsCount = careerGoalsCount;
    }

    public boolean isProfileComplete() {
        return profileComplete;
    }

    public void setProfileComplete(boolean profileComplete) {
        this.profileComplete = profileComplete;
    }
}
