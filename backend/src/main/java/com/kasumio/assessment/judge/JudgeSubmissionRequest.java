package com.kasumio.assessment.judge;

public class JudgeSubmissionRequest {
    private final String language;
    private final String sourceCode;
    private final String stdin;
    private final String expectedOutput;
    private final long timeLimitMs;
    private final long memoryLimitKb;
    private final int outputLimitBytes;

    public JudgeSubmissionRequest(String language, String sourceCode, String stdin, String expectedOutput,
                                  long timeLimitMs, long memoryLimitKb, int outputLimitBytes) {
        this.language = language;
        this.sourceCode = sourceCode;
        this.stdin = stdin;
        this.expectedOutput = expectedOutput;
        this.timeLimitMs = timeLimitMs > 0 ? timeLimitMs : 4000;
        this.memoryLimitKb = memoryLimitKb > 0 ? memoryLimitKb : 256 * 1024;
        this.outputLimitBytes = outputLimitBytes > 0 ? outputLimitBytes : 32 * 1024;
    }

    public String getLanguage() { return language; }
    public String getSourceCode() { return sourceCode; }
    public String getStdin() { return stdin; }
    public String getExpectedOutput() { return expectedOutput; }
    public long getTimeLimitMs() { return timeLimitMs; }
    public long getMemoryLimitKb() { return memoryLimitKb; }
    public int getOutputLimitBytes() { return outputLimitBytes; }
}
