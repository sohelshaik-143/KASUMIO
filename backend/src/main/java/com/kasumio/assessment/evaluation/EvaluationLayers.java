package com.kasumio.assessment.evaluation;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record EvaluationLayers(
        Layer1ExecutionFacts layer1Facts,
        Layer2DeterministicMarks layer2Marks,
        Layer3AiSuggestions layer3AiSuggestions,
        Layer4RecruiterReview layer4Review
) {
    public record Layer1ExecutionFacts(
            int testCasesPassed,
            int totalTestCases,
            long executionTimeMs,
            long memoryUsedKb,
            String compilationOutput,
            Double structuralSimilarity,
            Map<String, Object> telemetry
    ) {}

    public record Layer2DeterministicMarks(
            int pointsEarned,
            int maxPoints,
            String status,
            String scoringMethod
    ) {}

    public record Layer3AiSuggestions(
            int suggestedScore,
            List<String> strengths,
            List<String> weaknesses,
            String explanation,
            String recommendedConcepts,
            double confidence,
            boolean isHumanReviewRecommended
    ) {}

    public record Layer4RecruiterReview(
            Integer reviewedScore,
            String overrideReason,
            Long reviewedByUserId,
            Instant reviewedAt,
            String releaseStatus
    ) {}
}
