package com.kasumio.assessment;

import com.kasumio.assessment.dto.AssessmentValidationResultDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Validates recruiter-authored assessments prior to publication.
 * Enforces server-side marks consistency, rubrics, test coverage, and skill weightings.
 */
@Component
public class AssessmentValidator {

    public AssessmentValidationResultDto validate(Assessment assessment,
                                                  List<AssessmentQuestion> questions,
                                                  List<QuestionOption> options,
                                                  List<CodingProblem> codingProblems,
                                                  List<TestCase> testCases,
                                                  Map<String, Integer> skillWeightings) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        if (questions == null || questions.isEmpty()) {
            errors.add("Assessment must contain at least one question.");
            return new AssessmentValidationResultDto(false, 0, 0, errors, warnings);
        }

        if (assessment.getTimeLimitMinutes() == null || assessment.getTimeLimitMinutes() <= 0) {
            errors.add("Assessment time limit must be greater than zero minutes.");
        }

        int calculatedTotalMarks = 0;

        for (AssessmentQuestion q : questions) {
            if (q.getPoints() == null || q.getPoints() <= 0) {
                errors.add("Question '" + q.getTitle() + "' must have positive marks assigned.");
            } else {
                calculatedTotalMarks += q.getPoints();
            }

            if (q.getTitle() == null || q.getTitle().trim().isEmpty()) {
                errors.add("Question title cannot be empty.");
            }
            if (q.getPrompt() == null || q.getPrompt().trim().isEmpty()) {
                errors.add("Question prompt cannot be empty.");
            }

            // Image accessibility requirement: alt text required if image is uploaded
            if (q.getImageUrl() != null && !q.getImageUrl().isBlank()) {
                if (q.getImageAltText() == null || q.getImageAltText().trim().isEmpty()) {
                    errors.add("Question '" + q.getTitle() + "' has an image but is missing required alt text.");
                }
            }

            // Validate question-type specific criteria
            QuestionType type = q.getQuestionType();
            if (type.isChoiceBased()) {
                long qOptionsCount = options.stream().filter(o -> o.getQuestion().getId().equals(q.getId())).count();
                long correctOptionsCount = options.stream().filter(o -> o.getQuestion().getId().equals(q.getId()) && o.isCorrect()).count();
                if (qOptionsCount < 2) {
                    errors.add("MCQ Question '" + q.getTitle() + "' must have at least 2 options.");
                }
                if (correctOptionsCount == 0) {
                    errors.add("MCQ Question '" + q.getTitle() + "' must have at least 1 correct option marked.");
                }
            } else if (type.isCodeBased()) {
                CodingProblem cp = codingProblems.stream()
                        .filter(c -> c.getQuestion().getId().equals(q.getId()))
                        .findFirst()
                        .orElse(null);
                if (cp == null) {
                    errors.add("Coding Question '" + q.getTitle() + "' is missing its code specification.");
                } else {
                    long qTestCases = testCases.stream().filter(t -> t.getCodingProblem().getId().equals(cp.getId())).count();
                    if (qTestCases == 0) {
                        errors.add("Coding Question '" + q.getTitle() + "' must have at least one test case.");
                    }
                }
            } else if (type.isTextBased()) {
                if (q.getRubricJson() == null || q.getRubricJson().trim().isEmpty()) {
                    warnings.add("Question '" + q.getTitle() + "' has no structured evaluation rubric defined.");
                }
            }
        }

        // Validate skill weightings sum to 100 if specified
        if (skillWeightings != null && !skillWeightings.isEmpty()) {
            int totalWeight = skillWeightings.values().stream().mapToInt(Integer::intValue).sum();
            if (totalWeight != 100) {
                errors.add("Skill weightings must sum to exactly 100% (currently sums to " + totalWeight + "%).");
            }
        }

        boolean isValid = errors.isEmpty();
        return new AssessmentValidationResultDto(isValid, calculatedTotalMarks, questions.size(), errors, warnings);
    }
}
