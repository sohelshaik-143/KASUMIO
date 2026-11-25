package com.kasumio.assessment.judge;

/**
 * Fake in-memory CodeJudge for reliable, reproducible automated testing.
 */
public class FakeCodeJudge implements CodeJudge {

    private JudgeVerdict presetVerdict;

    public FakeCodeJudge() {
        this.presetVerdict = null;
    }

    public void setPresetVerdict(JudgeVerdict verdict) {
        this.presetVerdict = verdict;
    }

    @Override
    public JudgeVerdict execute(JudgeSubmissionRequest request) {
        if (presetVerdict != null) {
            return presetVerdict;
        }

        String code = request.getSourceCode() != null ? request.getSourceCode() : "";
        if (code.contains("COMPILATION_ERROR")) {
            return JudgeVerdict.error(JudgeStatus.COMPILATION_ERROR, "Simulated syntax error");
        }
        if (code.contains("TIME_LIMIT_EXCEEDED")) {
            return JudgeVerdict.error(JudgeStatus.TIME_LIMIT_EXCEEDED, "Execution timed out");
        }
        if (code.contains("RUNTIME_ERROR")) {
            return JudgeVerdict.error(JudgeStatus.RUNTIME_ERROR, "NullPointerException");
        }

        // Default mock pass logic: check if code produces expected output or returns true
        boolean passed = !code.contains("FAIL_TEST");
        return new JudgeVerdict(
                passed ? JudgeStatus.PASSED : JudgeStatus.FAILED,
                passed,
                request.getExpectedOutput() != null ? request.getExpectedOutput() : "42",
                "",
                "",
                120L,
                32768L,
                passed ? "Passed all simulated test cases." : "Wrong answer on test case."
        );
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public String getJudgeName() {
        return "FakeCodeJudge";
    }
}
