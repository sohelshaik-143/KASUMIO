package com.kasumio.assessment.dto;

import com.kasumio.assessment.DifficultyLevel;
import com.kasumio.assessment.QuestionType;
import java.util.List;
import java.util.Map;

public record QuestionBuilderDto(
        Long id,
        QuestionType questionType,
        DifficultyLevel difficulty,
        String skillName,
        String title,
        String prompt,
        Integer points,
        Integer orderIndex,
        String rubricJson,
        Integer timeLimitMinutes,
        List<String> expectedSkills,
        String imageUrl,
        String imageAltText,
        String imageCaption,
        List<OptionSpec> options,
        CodingProblemSpec codingProblem
) {
    public record OptionSpec(
            Long id,
            String text,
            boolean isCorrect,
            String explanation,
            int orderIndex
    ) {}

    public record CodingProblemSpec(
            String problemStatement,
            String constraints,
            String allowedLanguages,
            Map<String, String> starterCodeByLang,
            List<TestCaseSpec> testCases
    ) {}

    public record TestCaseSpec(
            Long id,
            String inputData,
            String expectedOutput,
            boolean isHidden,
            String explanation
    ) {}
}
