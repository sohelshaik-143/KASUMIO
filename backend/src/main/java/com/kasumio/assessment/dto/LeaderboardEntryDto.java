package com.kasumio.assessment.dto;

import java.time.Instant;
import java.util.List;

public class LeaderboardEntryDto {
    private int rank;
    private Long studentId;
    private String candidateAlias;
    private String university;
    private int totalScore;
    private int problemsSolved;
    private int assessmentsCompleted;
    private double overallAccuracy;
    private String highestDifficultyHandled;
    private List<String> verifiedSkillBadges;
    private Instant lastActiveAt;

    public LeaderboardEntryDto() {}

    public LeaderboardEntryDto(int rank, Long studentId, String candidateAlias, String university,
                               int totalScore, int problemsSolved, int assessmentsCompleted,
                               double overallAccuracy, String highestDifficultyHandled,
                               List<String> verifiedSkillBadges, Instant lastActiveAt) {
        this.rank = rank;
        this.studentId = studentId;
        this.candidateAlias = candidateAlias;
        this.university = university;
        this.totalScore = totalScore;
        this.problemsSolved = problemsSolved;
        this.assessmentsCompleted = assessmentsCompleted;
        this.overallAccuracy = overallAccuracy;
        this.highestDifficultyHandled = highestDifficultyHandled;
        this.verifiedSkillBadges = verifiedSkillBadges;
        this.lastActiveAt = lastActiveAt;
    }

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getCandidateAlias() { return candidateAlias; }
    public void setCandidateAlias(String candidateAlias) { this.candidateAlias = candidateAlias; }
    public String getUniversity() { return university; }
    public void setUniversity(String university) { this.university = university; }
    public int getTotalScore() { return totalScore; }
    public void setTotalScore(int totalScore) { this.totalScore = totalScore; }
    public int getProblemsSolved() { return problemsSolved; }
    public void setProblemsSolved(int problemsSolved) { this.problemsSolved = problemsSolved; }
    public int getAssessmentsCompleted() { return assessmentsCompleted; }
    public void setAssessmentsCompleted(int assessmentsCompleted) { this.assessmentsCompleted = assessmentsCompleted; }
    public double getOverallAccuracy() { return overallAccuracy; }
    public void setOverallAccuracy(double overallAccuracy) { this.overallAccuracy = overallAccuracy; }
    public String getHighestDifficultyHandled() { return highestDifficultyHandled; }
    public void setHighestDifficultyHandled(String highestDifficultyHandled) { this.highestDifficultyHandled = highestDifficultyHandled; }
    public List<String> getVerifiedSkillBadges() { return verifiedSkillBadges; }
    public void setVerifiedSkillBadges(List<String> verifiedSkillBadges) { this.verifiedSkillBadges = verifiedSkillBadges; }
    public Instant getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(Instant lastActiveAt) { this.lastActiveAt = lastActiveAt; }
}
