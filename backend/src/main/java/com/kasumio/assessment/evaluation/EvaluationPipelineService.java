package com.kasumio.assessment.evaluation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.assessment.*;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

/**
 * 4-Layer AI Evaluation Pipeline Coordinator:
 * Layer 1: Verified Execution Facts (sandbox runtime facts)
 * Layer 2: Deterministic Marks (test case / rubric score)
 * Layer 3: AI Suggestions (advisory explanations, strengths, weaknesses)
 * Layer 4: Recruiter-Reviewed Marks (override with audit trail)
 */
@Service
public class EvaluationPipelineService {

    private static final Logger log = LoggerFactory.getLogger(EvaluationPipelineService.class);

    private final QuestionSubmissionRepository submissionRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final AiEvaluationEngine aiEngine;
    private final ObjectMapper objectMapper;

    public EvaluationPipelineService(QuestionSubmissionRepository submissionRepository,
                                     AssessmentAttemptRepository attemptRepository,
                                     AiEvaluationEngine aiEngine,
                                     ObjectMapper objectMapper) {
        this.submissionRepository = submissionRepository;
        this.attemptRepository = attemptRepository;
        this.aiEngine = aiEngine;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public EvaluationLayers evaluateSubmission(QuestionSubmission submission) {
        // Layer 1: Verified Execution Facts
        Map<String, Object> telemetry = new HashMap<>();
        if (submission.getTelemetryJson() != null) {
            try {
                telemetry = objectMapper.readValue(submission.getTelemetryJson(), Map.class);
            } catch (Exception ignored) {}
        }

        EvaluationLayers.Layer1ExecutionFacts layer1 = new EvaluationLayers.Layer1ExecutionFacts(
                submission.getTestCasesPassed(),
                submission.getTotalTestCases(),
                submission.getExecutionTimeMs(),
                submission.getMemoryUsedKb(),
                null,
                submission.getSimilarityScore(),
                telemetry
        );

        // Layer 2: Deterministic Marks
        int pointsEarned = calculateDeterministicMarks(submission);
        int maxPoints = submission.getQuestion().getPoints();
        String method = submission.getQuestion().getQuestionType().isCodeBased()
                ? "TEST_CASE_PROPORTION"
                : (submission.getQuestion().getQuestionType().isChoiceBased() ? "OPTION_MATCH" : "RUBRIC_CRITERIA");

        EvaluationLayers.Layer2DeterministicMarks layer2 = new EvaluationLayers.Layer2DeterministicMarks(
                pointsEarned, maxPoints, submission.getStatus().name(), method
        );

        // Layer 3: AI Suggestions (Advisory only - never overwrites marks)
        EvaluationLayers.Layer3AiSuggestions layer3 = aiEngine.generateSuggestions(submission, layer1, layer2);

        // Layer 4: Recruiter-Reviewed Marks
        EvaluationLayers.Layer4RecruiterReview layer4;
        if (submission.getReviewedScore() != null) {
            layer4 = new EvaluationLayers.Layer4RecruiterReview(
                    submission.getReviewedScore(),
                    submission.getReviewReason(),
                    null,
                    Instant.now(),
                    "REVIEWED"
            );
        } else {
            layer4 = new EvaluationLayers.Layer4RecruiterReview(
                    null, null, null, null, "PENDING_REVIEW"
            );
        }

        EvaluationLayers fullPipeline = new EvaluationLayers(layer1, layer2, layer3, layer4);

        try {
            submission.setEvaluatedScore(pointsEarned);
            submission.setEvaluationLayersJson(objectMapper.writeValueAsString(fullPipeline));
            submissionRepository.save(submission);
        } catch (Exception e) {
            log.error("Failed to serialize evaluation layers for submission {}: {}", submission.getId(), e.getMessage());
        }

        return fullPipeline;
    }

    @Transactional
    public EvaluationLayers overrideSubmissionScore(Long attemptId, Long submissionId,
                                                    Integer overrideScore, String reason, User recruiter) {
        AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));

        if (recruiter.getRole() != Role.ADMIN) {
            User oppRecruiter = attempt.getAssessment().getOpportunity().getRecruiter();
            if (oppRecruiter == null || !oppRecruiter.getId().equals(recruiter.getId())) {
                throw new AccessDeniedException("Only the opportunity's recruiter can override assessment marks.");
            }
        }

        QuestionSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found: " + submissionId));

        if (overrideScore < 0 || overrideScore > submission.getQuestion().getPoints()) {
            throw new IllegalArgumentException("Override score must be between 0 and " + submission.getQuestion().getPoints());
        }

        submission.setReviewedScore(overrideScore);
        submission.setReviewReason(reason != null ? reason.trim() : "Recruiter verified manual override");

        EvaluationLayers layers = evaluateSubmission(submission);
        recalculateAttemptFinalScore(attempt);

        return layers;
    }

    @Transactional
    public void evaluateEntireAttempt(AssessmentAttempt attempt) {
        List<QuestionSubmission> submissions = submissionRepository.findByAttemptOrderByCreatedAtAsc(attempt);
        for (QuestionSubmission sub : submissions) {
            evaluateSubmission(sub);
        }
        recalculateAttemptFinalScore(attempt);
    }

    private void recalculateAttemptFinalScore(AssessmentAttempt attempt) {
        List<QuestionSubmission> submissions = submissionRepository.findByAttemptOrderByCreatedAtAsc(attempt);
        int totalFinal = 0;
        for (QuestionSubmission s : submissions) {
            if (s.getReviewedScore() != null) {
                totalFinal += s.getReviewedScore();
            } else if (s.getEvaluatedScore() != null) {
                totalFinal += s.getEvaluatedScore();
            } else {
                totalFinal += calculateDeterministicMarks(s);
            }
        }
        attempt.setFinalScore(totalFinal);
        attempt.setScore(totalFinal);
        attemptRepository.save(attempt);
    }

    private int calculateDeterministicMarks(QuestionSubmission s) {
        int maxPoints = s.getQuestion().getPoints();
        if (s.getQuestion().getQuestionType().isCodeBased()) {
            if (s.getTotalTestCases() > 0) {
                return (int) Math.round(((double) s.getTestCasesPassed() / s.getTotalTestCases()) * maxPoints);
            }
            return s.getStatus() == SubmissionStatus.PASSED ? maxPoints : 0;
        } else if (s.getQuestion().getQuestionType().isChoiceBased()) {
            return s.getStatus() == SubmissionStatus.PASSED ? maxPoints : 0;
        } else {
            // Text-based: valid non-empty response gets points
            return s.getStatus() == SubmissionStatus.PASSED ? maxPoints : 0;
        }
    }
}
