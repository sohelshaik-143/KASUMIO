package com.kasumio.assessment.dto;

import com.kasumio.assessment.AssessmentIntegrityStatus;
import com.kasumio.assessment.AttemptStatus;
import java.time.Instant;

public record AttemptIntegrityDetailsDto(
        Long attemptId,
        AttemptStatus status,
        AssessmentIntegrityStatus integrityStatus,
        int violationCount,
        boolean attemptLocked,
        boolean overturnedByRecruiter,
        String overturnReason,
        Instant consentGivenAt,
        String integritySignalsJson,
        String integrityEventsJson
) {}
