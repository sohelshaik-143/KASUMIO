package com.kasumio.assessment.dto;

import com.kasumio.assessment.AssessmentStatus;
import java.util.List;
import java.util.Map;

public record AssessmentBuilderDto(
        Long id,
        Long opportunityId,
        String opportunityTitle,
        String title,
        String description,
        Integer timeLimitMinutes,
        Integer passingScore,
        AssessmentStatus status,
        Integer versionNumber,
        Integer totalMarks,
        Map<String, Integer> skillWeightings,
        String passingCriteria,
        List<QuestionBuilderDto> questions
) {}
