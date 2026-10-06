package com.kasumio.assessment;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Fair Assessment Integrity Analysis Service.
 * 
 * CORE PRINCIPLE:
 * Assessment signals are evidence, NEVER automatic proof of cheating.
 * Fast solutions = High proficiency, NOT suspicious.
 * Accidental window blurs or small copy/pastes = Normal behavior.
 * Serious anomaly patterns generate a REVIEW_RECOMMENDED flag for human inspection,
 * NEVER an automated rejection.
 */
@Service
public class FairIntegrityAnalysisService {

    public static class IntegrityTelemetryInput {
        public int totalFocusChanges = 0;
        public int totalPasteEvents = 0;
        public int totalCodeEdits = 0;
        public int largeCodeChanges = 0;
        public int compilationErrors = 0;
        public long durationSeconds = 0;
        public int totalQuestions = 0;
        public int solvedQuestions = 0;
        public int testCasesPassed = 0;
        public int totalTestCases = 0;
        public double maxSimilarityScore = 0.0;
    }

    public static class IntegrityEvaluationReport {
        public AssessmentIntegrityStatus status = AssessmentIntegrityStatus.NORMAL;
        public int overallIntegrityScore = 95; // 0-100
        public List<String> observations = new ArrayList<>();
        public String recruiterSummary;
        public boolean requiresHumanReview = false;
    }

    /**
     * Synthesizes assessment telemetry signals into an evidence-backed integrity report.
     */
    public IntegrityEvaluationReport evaluate(IntegrityTelemetryInput input) {
        IntegrityEvaluationReport report = new IntegrityEvaluationReport();

        // 1. Skill vs Cheating Rule: Rapid completion with high test pass rate
        boolean isHighAccuracy = input.totalTestCases > 0 && ((double) input.testCasesPassed / input.totalTestCases) >= 0.85;
        boolean isFast = input.durationSeconds > 0 && input.durationSeconds < (input.totalQuestions * 180L); // < 3 mins per question

        if (isFast && isHighAccuracy) {
            report.observations.add(
                    String.format("Rapid problem-solving: Completed in %.1f minutes with %d/%d test cases passed (Demonstrates strong algorithmic fluency).",
                            input.durationSeconds / 60.0, input.testCasesPassed, input.totalTestCases)
            );
        }

        // 2. Focus Change / Window Switch Telemetry (Anti-punitive)
        if (input.totalFocusChanges == 0) {
            report.observations.add("Window Focus: Sustained focus maintained throughout assessment.");
        } else if (input.totalFocusChanges <= 5) {
            report.observations.add(String.format("Window Focus: %d minor focus switch(es) detected (Consistent with accidental OS notifications or system alerts; Normal).",
                    input.totalFocusChanges));
        } else if (input.totalFocusChanges <= 12) {
            report.observations.add(String.format("Window Focus: %d focus switches detected (Moderate environment interruptions recorded).",
                    input.totalFocusChanges));
            report.overallIntegrityScore -= 10;
        } else {
            report.observations.add(String.format("Window Focus: %d window switches recorded during test session.",
                    input.totalFocusChanges));
            report.overallIntegrityScore -= 25;
        }

        // 3. Paste and Code Insertion Activity
        if (input.totalPasteEvents == 0 && input.largeCodeChanges == 0) {
            report.observations.add("Typing Dynamics: Solution typed progressively with continuous incremental edits.");
        } else if (input.totalPasteEvents <= 3 && input.largeCodeChanges <= 1) {
            report.observations.add(String.format("Code Inputs: %d minor paste event(s) noted (Consistent with template variable copy or snippet adjustment; Normal).",
                    input.totalPasteEvents));
        } else if (input.largeCodeChanges > 2 && input.totalCodeEdits < 10) {
            report.observations.add(String.format("Code Inputs: %d large code block replacement(s) with minimal incremental keystrokes.",
                    input.largeCodeChanges));
            report.overallIntegrityScore -= 20;
        }

        // 4. Compilation & Execution Resilience
        if (input.compilationErrors > 0) {
            report.observations.add(String.format("Iterative Debugging: %d compilation error(s) resolved iteratively during problem-solving.",
                    input.compilationErrors));
        }

        // 5. Code Similarity check
        if (input.maxSimilarityScore > 0.88) {
            report.observations.add(String.format("Code Similarity: Solution structure mirrors known canonical pattern (%.0f%% token overlap; Recruiter context available).",
                    input.maxSimilarityScore * 100));
            report.overallIntegrityScore -= 15;
        }

        // 6. Classification without automated punishment
        if (report.overallIntegrityScore >= 80) {
            report.status = AssessmentIntegrityStatus.NORMAL;
            report.recruiterSummary = "No significant integrity concerns detected. Telemetry and problem-solving patterns are fully consistent with authentic candidate execution.";
            report.requiresHumanReview = false;
        } else if (report.overallIntegrityScore >= 65) {
            report.status = AssessmentIntegrityStatus.MINOR_ANOMALY;
            report.recruiterSummary = "Minor telemetry variations recorded (such as desktop window switches or block pasting). Candidate demonstrated technical capability.";
            report.requiresHumanReview = false;
        } else if (report.overallIntegrityScore >= 50) {
            report.status = AssessmentIntegrityStatus.REVIEW_RECOMMENDED;
            report.recruiterSummary = "Review recommended: Multiple combined behavioral anomalies noted (window switches + large block insertions). Inspect submitted code and telemetry before final decision.";
            report.requiresHumanReview = true;
        } else {
            report.status = AssessmentIntegrityStatus.STRONG_ANOMALY_PATTERN;
            report.recruiterSummary = "Strong anomaly pattern recorded across session telemetry. Detailed signal breakdown is preserved for recruiter review. No automated disqualification applied.";
            report.requiresHumanReview = true;
        }

        return report;
    }
}
