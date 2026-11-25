package com.kasumio.assessment.dto;

import java.util.List;

/**
 * Server-side telemetry evaluation response.
 * Enforces the Two-Confirmed-Violation policy with non-punitive audit trail.
 */
public record TelemetryResponse(
        int violationCount,
        String violationStatus, // "NORMAL", "WARNING_1", "TERMINATED_LOCKED"
        String warningMessage,
        boolean attemptLocked,
        List<String> activeEvents
) {
    public TelemetryResponse(int violationCount, String violationStatus, String warningMessage, boolean attemptLocked) {
        this(violationCount, violationStatus, warningMessage, attemptLocked, List.of());
    }
}
