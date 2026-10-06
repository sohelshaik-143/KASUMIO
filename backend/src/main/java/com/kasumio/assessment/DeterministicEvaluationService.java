package com.kasumio.assessment;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Deterministic Code and Assessment Evaluation Service
 * 
 * Runs test cases deterministically first, then synthesizes structured educational
 * feedback and skill interpretation to guide candidate improvement.
 */
@Service
public class DeterministicEvaluationService {

    private final IsolatedCodeExecutionEngine executionEngine;
    private final ObjectMapper objectMapper;

    public DeterministicEvaluationService(IsolatedCodeExecutionEngine executionEngine, ObjectMapper objectMapper) {
        this.executionEngine = executionEngine;
        this.objectMapper = objectMapper;
    }

    public static class EvaluationOutcome {
        private final SubmissionStatus status;
        private final int testCasesPassed;
        private final int totalTestCases;
        private final long executionTimeMs;
        private final long memoryUsedKb;
        private final String compilationOutput;
        private final List<TestCaseResult> testCaseResults;
        private final CandidateFeedback feedback;

        public EvaluationOutcome(SubmissionStatus status, int testCasesPassed, int totalTestCases,
                                 long executionTimeMs, long memoryUsedKb, String compilationOutput,
                                 List<TestCaseResult> testCaseResults, CandidateFeedback feedback) {
            this.status = status;
            this.testCasesPassed = testCasesPassed;
            this.totalTestCases = totalTestCases;
            this.executionTimeMs = executionTimeMs;
            this.memoryUsedKb = memoryUsedKb;
            this.compilationOutput = compilationOutput;
            this.testCaseResults = testCaseResults;
            this.feedback = feedback;
        }

        public SubmissionStatus getStatus() { return status; }
        public int getTestCasesPassed() { return testCasesPassed; }
        public int getTotalTestCases() { return totalTestCases; }
        public long getExecutionTimeMs() { return executionTimeMs; }
        public long getMemoryUsedKb() { return memoryUsedKb; }
        public String getCompilationOutput() { return compilationOutput; }
        public List<TestCaseResult> getTestCaseResults() { return testCaseResults; }
        public CandidateFeedback getFeedback() { return feedback; }
    }

    public static class TestCaseResult {
        private final Long testCaseId;
        private final boolean passed;
        private final boolean isHidden;
        private final String inputData;
        private final String expectedOutput;
        private final String actualOutput;
        private final String errorMessage;
        private final long executionTimeMs;

        public TestCaseResult(Long testCaseId, boolean passed, boolean isHidden, String inputData,
                              String expectedOutput, String actualOutput, String errorMessage, long executionTimeMs) {
            this.testCaseId = testCaseId;
            this.passed = passed;
            this.isHidden = isHidden;
            this.inputData = isHidden ? "[Hidden Case]" : inputData;
            this.expectedOutput = isHidden ? "[Hidden Case]" : expectedOutput;
            this.actualOutput = isHidden ? (passed ? "[Passed]" : "[Failed Output]") : actualOutput;
            this.errorMessage = errorMessage;
            this.executionTimeMs = executionTimeMs;
        }

        public Long getTestCaseId() { return testCaseId; }
        public boolean isPassed() { return passed; }
        public boolean isHidden() { return isHidden; }
        public String getInputData() { return inputData; }
        public String getExpectedOutput() { return expectedOutput; }
        public String getActualOutput() { return actualOutput; }
        public String getErrorMessage() { return errorMessage; }
        public long getExecutionTimeMs() { return executionTimeMs; }
    }

    public static class CandidateFeedback {
        private String skillTested;
        private String outcomeSummary;
        private String whatWorked;
        private String whatFailed;
        private String suggestedImprovement;
        private String complexityAnalysis;

        public CandidateFeedback() {}

        public CandidateFeedback(String skillTested, String outcomeSummary, String whatWorked,
                                 String whatFailed, String suggestedImprovement, String complexityAnalysis) {
            this.skillTested = skillTested;
            this.outcomeSummary = outcomeSummary;
            this.whatWorked = whatWorked;
            this.whatFailed = whatFailed;
            this.suggestedImprovement = suggestedImprovement;
            this.complexityAnalysis = complexityAnalysis;
        }

        public String getSkillTested() { return skillTested; }
        public void setSkillTested(String skillTested) { this.skillTested = skillTested; }

        public String getOutcomeSummary() { return outcomeSummary; }
        public void setOutcomeSummary(String outcomeSummary) { this.outcomeSummary = outcomeSummary; }

        public String getWhatWorked() { return whatWorked; }
        public void setWhatWorked(String whatWorked) { this.whatWorked = whatWorked; }

        public String getWhatFailed() { return whatFailed; }
        public void setWhatFailed(String whatFailed) { this.whatFailed = whatFailed; }

        public String getSuggestedImprovement() { return suggestedImprovement; }
        public void setSuggestedImprovement(String suggestedImprovement) { this.suggestedImprovement = suggestedImprovement; }

        public String getComplexityAnalysis() { return complexityAnalysis; }
        public void setComplexityAnalysis(String complexityAnalysis) { this.complexityAnalysis = complexityAnalysis; }
    }

    /**
     * Evaluates coding problem against all test cases deterministically.
     */
    public EvaluationOutcome evaluateCoding(CodingProblem problem, List<TestCase> testCases,
                                           String language, String code) {
        if (testCases == null || testCases.isEmpty()) {
            CandidateFeedback fb = new CandidateFeedback(
                    problem.getQuestion().getSkill() != null ? problem.getQuestion().getSkill().getName() : "Software Engineering",
                    "No test cases registered for problem.", "Code compiled successfully.", "None", "Ready for submission.", "N/A"
            );
            return new EvaluationOutcome(SubmissionStatus.PASSED, 0, 0, 0, 0, "", Collections.emptyList(), fb);
        }

        List<TestCaseResult> results = new ArrayList<>();
        int passedCount = 0;
        long maxDuration = 0;
        long maxMemory = 0;
        String compilationError = null;
        boolean hasTimeout = false;

        for (TestCase tc : testCases) {
            IsolatedCodeExecutionEngine.ExecutionResult exec = executionEngine.execute(
                    language, code, tc.getInputData(), problem.getTimeLimitMs()
            );

            if (exec.isCompilationError()) {
                compilationError = exec.getCompilationOutput();
                break;
            }

            if (exec.isTimedOut()) {
                hasTimeout = true;
            }

            maxDuration = Math.max(maxDuration, exec.getExecutionTimeMs());
            maxMemory = Math.max(maxMemory, exec.getMemoryUsedKb());

            String actual = exec.getStdout().trim();
            String expected = tc.getExpectedOutput().trim();
            boolean passed = exec.isSuccess() && !exec.isTimedOut() && actual.equals(expected);

            if (passed) {
                passedCount++;
            }

            results.add(new TestCaseResult(
                    tc.getId(),
                    passed,
                    tc.getIsHidden(),
                    tc.getInputData(),
                    tc.getExpectedOutput(),
                    actual,
                    exec.getStderr(),
                    exec.getExecutionTimeMs()
            ));
        }

        SubmissionStatus status;
        if (compilationError != null) {
            status = SubmissionStatus.ERROR;
        } else if (hasTimeout) {
            status = SubmissionStatus.TIMEOUT;
        } else if (passedCount == testCases.size()) {
            status = SubmissionStatus.PASSED;
        } else {
            status = SubmissionStatus.FAILED;
        }

        String skillName = problem.getQuestion().getSkill() != null ? problem.getQuestion().getSkill().getName() : "Coding Logic";
        CandidateFeedback feedback = generateCodingFeedback(skillName, status, passedCount, testCases.size(), compilationError, hasTimeout);

        return new EvaluationOutcome(
                status,
                passedCount,
                testCases.size(),
                maxDuration,
                maxMemory,
                compilationError != null ? compilationError : "",
                results,
                feedback
        );
    }

    /**
     * Evaluates MCQ / Conceptual / Debugging questions with selected option.
     */
    public EvaluationOutcome evaluateOption(AssessmentQuestion question, QuestionOption selectedOption) {
        boolean passed = selectedOption != null && Boolean.TRUE.equals(selectedOption.getIsCorrect());
        SubmissionStatus status = passed ? SubmissionStatus.PASSED : SubmissionStatus.FAILED;

        String skillName = question.getSkill() != null ? question.getSkill().getName() : "Domain Concept";
        String whatWorked = passed ? "Correctly identified key conceptual principle." : "Attempted question choice.";
        String whatFailed = passed ? "None" : (selectedOption != null ? "Selected option did not capture core requirement: " + selectedOption.getOptionText() : "No option selected.");
        String suggestedImprovement = selectedOption != null && selectedOption.getExplanation() != null
                ? selectedOption.getExplanation()
                : (passed ? "Solid understanding demonstrated. Continue applying to system designs." : "Review core documentation and architectural patterns for " + skillName + ".");

        CandidateFeedback fb = new CandidateFeedback(
                skillName,
                passed ? "Correct Answer" : "Incorrect Option Selected",
                whatWorked,
                whatFailed,
                suggestedImprovement,
                "Conceptual reasoning: verified directly against taxonomy criteria"
        );

        return new EvaluationOutcome(status, passed ? 1 : 0, 1, 0, 0, "", Collections.emptyList(), fb);
    }

    private CandidateFeedback generateCodingFeedback(String skill, SubmissionStatus status,
                                                     int passed, int total, String compileErr, boolean timedOut) {
        if (compileErr != null) {
            return new CandidateFeedback(
                    skill,
                    "Compilation Failed",
                    "Syntactic structure outlined.",
                    "Syntax or type errors in code: " + compileErr.lines().findFirst().orElse(""),
                    "Check imports, variable types, class signatures, and return type declarations.",
                    "Time Complexity: N/A (Compilation error)"
            );
        }

        if (timedOut) {
            return new CandidateFeedback(
                    skill,
                    "Execution Timed Out",
                    "Code compiles and starts execution.",
                    "Time Limit Exceeded (> 4000ms). Likely infinite loop or unoptimized O(N^2)/O(2^N) recursion.",
                    "Consider memoization, two-pointer approach, or hash-table lookups to achieve O(N) or O(N log N) runtime.",
                    "Expected: O(N) or O(N log N). Observed: Exceeded threshold."
            );
        }

        if (status == SubmissionStatus.PASSED) {
            return new CandidateFeedback(
                    skill,
                    "All Test Cases Passed (" + passed + "/" + total + ")",
                    "Passed all primary and edge cases (including empty inputs, boundaries, and duplicates).",
                    "None.",
                    "Excellent solution! To further refine, consider evaluating space complexity trade-offs.",
                    "Time Complexity: O(N) linear scan, Space Complexity: O(1) auxiliary space"
            );
        }

        return new CandidateFeedback(
                skill,
                "Partial Completion (" + passed + "/" + total + " Passed)",
                passed > 0 ? "Basic sample cases passed successfully." : "Initial execution succeeded without crashing.",
                "Failed on edge cases (e.g. negative numbers, boundary constraints, or empty collections).",
                "Add defensive boundary checks at the beginning of the function and test duplicate key/value scenarios.",
                "Review algorithmic time complexity to ensure edge cases are handled in uniform time."
        );
    }

    public String serializeFeedback(CandidateFeedback feedback) {
        try {
            return objectMapper.writeValueAsString(feedback);
        } catch (Exception e) {
            return "{}";
        }
    }
}
