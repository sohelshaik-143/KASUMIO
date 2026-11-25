package com.kasumio.assessment.judge;

public class JudgeVerdict {
    private final JudgeStatus status;
    private final boolean passed;
    private final String stdout;
    private final String stderr;
    private final String compileOutput;
    private final long executionTimeMs;
    private final long memoryUsedKb;
    private final String message;

    public JudgeVerdict(JudgeStatus status, boolean passed, String stdout, String stderr,
                        String compileOutput, long executionTimeMs, long memoryUsedKb, String message) {
        this.status = status;
        this.passed = passed;
        this.stdout = stdout;
        this.stderr = stderr;
        this.compileOutput = compileOutput;
        this.executionTimeMs = executionTimeMs;
        this.memoryUsedKb = memoryUsedKb;
        this.message = message;
    }

    public static JudgeVerdict disabled(String message) {
        return new JudgeVerdict(JudgeStatus.DISABLED, false, "", "", message, 0, 0, message);
    }

    public static JudgeVerdict error(JudgeStatus status, String errorMessage) {
        return new JudgeVerdict(status, false, "", errorMessage, errorMessage, 0, 0, errorMessage);
    }

    public JudgeStatus getStatus() { return status; }
    public boolean isPassed() { return passed; }
    public String getStdout() { return stdout; }
    public String getStderr() { return stderr; }
    public String getCompileOutput() { return compileOutput; }
    public long getExecutionTimeMs() { return executionTimeMs; }
    public long getMemoryUsedKb() { return memoryUsedKb; }
    public String getMessage() { return message; }
}
