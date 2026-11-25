package com.kasumio.assessment.dto;

import java.util.List;

public record AssessmentValidationResultDto(
        boolean isValid,
        int totalMarks,
        int questionCount,
        List<String> errors,
        List<String> warnings
) {}
