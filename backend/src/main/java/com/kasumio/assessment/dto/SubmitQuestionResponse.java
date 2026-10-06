package com.kasumio.assessment.dto;

import com.kasumio.assessment.DifficultyLevel;
import com.kasumio.assessment.SubmissionStatus;
import com.kasumio.assessment.DeterministicEvaluationService;

public class SubmitQuestionResponse {
    private Long submissionId;
    private SubmissionStatus status;
    private int pointsEarned;
    private int maxPoints;
    private int totalAttemptScore;
    private DifficultyLevel nextDifficulty;
    private boolean hasNextQuestion;
    private DeterministicEvaluationService.CandidateFeedback feedback;

    public SubmitQuestionResponse() {}

    public SubmitQuestionResponse(Long submissionId, SubmissionStatus status, int pointsEarned, int maxPoints,
                                  int totalAttemptScore, DifficultyLevel nextDifficulty, boolean hasNextQuestion,
                                  DeterministicEvaluationService.CandidateFeedback feedback) {
        this.submissionId = submissionId;
        this.status = status;
        this.pointsEarned = pointsEarned;
        this.maxPoints = maxPoints;
        this.totalAttemptScore = totalAttemptScore;
        this.nextDifficulty = nextDifficulty;
        this.hasNextQuestion = hasNextQuestion;
        this.feedback = feedback;
    }

    public Long getSubmissionId() { return submissionId; }
    public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }
    public SubmissionStatus getStatus() { return status; }
    public void setStatus(SubmissionStatus status) { this.status = status; }
    public int getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(int pointsEarned) { this.pointsEarned = pointsEarned; }
    public int getMaxPoints() { return maxPoints; }
    public void setMaxPoints(int maxPoints) { this.maxPoints = maxPoints; }
    public int getTotalAttemptScore() { return totalAttemptScore; }
    public void setTotalAttemptScore(int totalAttemptScore) { this.totalAttemptScore = totalAttemptScore; }
    public DifficultyLevel getNextDifficulty() { return nextDifficulty; }
    public void setNextDifficulty(DifficultyLevel nextDifficulty) { this.nextDifficulty = nextDifficulty; }
    public boolean isHasNextQuestion() { return hasNextQuestion; }
    public void setHasNextQuestion(boolean hasNextQuestion) { this.hasNextQuestion = hasNextQuestion; }
    public DeterministicEvaluationService.CandidateFeedback getFeedback() { return feedback; }
    public void setFeedback(DeterministicEvaluationService.CandidateFeedback feedback) { this.feedback = feedback; }
}
