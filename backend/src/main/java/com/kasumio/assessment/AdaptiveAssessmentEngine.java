package com.kasumio.assessment;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Adaptive Assessment Engine
 * 
 * Adapts question difficulty and sequencing dynamically according to candidate performance.
 * Ensures the candidate is tested at an appropriate difficulty tier without random jumps.
 */
@Service
public class AdaptiveAssessmentEngine {

    public DifficultyLevel determineNextDifficulty(DifficultyLevel currentDifficulty, boolean previousPassed) {
        if (currentDifficulty == null) return DifficultyLevel.MEDIUM;

        if (previousPassed) {
            switch (currentDifficulty) {
                case EASY: return DifficultyLevel.MEDIUM;
                case MEDIUM: return DifficultyLevel.HARD;
                case HARD: return DifficultyLevel.HARD;
            }
        } else {
            switch (currentDifficulty) {
                case HARD: return DifficultyLevel.MEDIUM;
                case MEDIUM: return DifficultyLevel.EASY;
                case EASY: return DifficultyLevel.EASY;
            }
        }
        return DifficultyLevel.MEDIUM;
    }

    public Optional<AssessmentQuestion> selectNextAdaptiveQuestion(List<AssessmentQuestion> allQuestions,
                                                                   List<Long> answeredQuestionIds,
                                                                   DifficultyLevel targetDifficulty) {
        if (allQuestions == null || allQuestions.isEmpty()) {
            return Optional.empty();
        }

        // 1. Try to find an unanswered question matching targetDifficulty
        Optional<AssessmentQuestion> matching = allQuestions.stream()
                .filter(q -> !answeredQuestionIds.contains(q.getId()))
                .filter(q -> q.getDifficulty() == targetDifficulty)
                .findFirst();

        if (matching.isPresent()) {
            return matching;
        }

        // 2. Fallback to any remaining unanswered question in order
        return allQuestions.stream()
                .filter(q -> !answeredQuestionIds.contains(q.getId()))
                .findFirst();
    }

    public String computeDemonstratedCapability(int score, int maxScore, int codingPassed, int totalCoding) {
        if (maxScore <= 0) return "UNASSESSED";
        double percentage = ((double) score / maxScore) * 100.0;

        if (percentage >= 85.0 && codingPassed >= totalCoding) {
            return "ADVANCED";
        } else if (percentage >= 70.0) {
            return "PROFICIENT";
        } else if (percentage >= 50.0) {
            return "COMPETENT";
        } else {
            return "DEVELOPING";
        }
    }
}
