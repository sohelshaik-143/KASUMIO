package com.kasumio.assessment.dto;

import com.kasumio.assessment.DeterministicEvaluationService;

import java.util.List;

public class RunCodeResponse {
    private boolean success;
    private boolean compilationError;
    private String compilationOutput;
    private String stdout;
    private String stderr;
    private long executionTimeMs;
    private long memoryUsedKb;
    private boolean timedOut;
    private List<DeterministicEvaluationService.TestCaseResult> sampleResults;

    public RunCodeResponse() {}

    public RunCodeResponse(boolean success, boolean compilationError, String compilationOutput,
                           String stdout, String stderr, long executionTimeMs, long memoryUsedKb,
                           boolean timedOut, List<DeterministicEvaluationService.TestCaseResult> sampleResults) {
        this.success = success;
        this.compilationError = compilationError;
        this.compilationOutput = compilationOutput;
        this.stdout = stdout;
        this.stderr = stderr;
        this.executionTimeMs = executionTimeMs;
        this.memoryUsedKb = memoryUsedKb;
        this.timedOut = timedOut;
        this.sampleResults = sampleResults;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public boolean isCompilationError() { return compilationError; }
    public void setCompilationError(boolean compilationError) { this.compilationError = compilationError; }
    public String getCompilationOutput() { return compilationOutput; }
    public void setCompilationOutput(String compilationOutput) { this.compilationOutput = compilationOutput; }
    public String getStdout() { return stdout; }
    public void setStdout(String stdout) { this.stdout = stdout; }
    public String getStderr() { return stderr; }
    public void setStderr(String stderr) { this.stderr = stderr; }
    public long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(long executionTimeMs) { this.executionTimeMs = executionTimeMs; }
    public long getMemoryUsedKb() { return memoryUsedKb; }
    public void setMemoryUsedKb(long memoryUsedKb) { this.memoryUsedKb = memoryUsedKb; }
    public boolean isTimedOut() { return timedOut; }
    public void setTimedOut(boolean timedOut) { this.timedOut = timedOut; }
    public List<DeterministicEvaluationService.TestCaseResult> getSampleResults() { return sampleResults; }
    public void setSampleResults(List<DeterministicEvaluationService.TestCaseResult> sampleResults) { this.sampleResults = sampleResults; }
}
