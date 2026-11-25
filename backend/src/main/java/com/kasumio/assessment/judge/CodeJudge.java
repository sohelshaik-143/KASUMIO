package com.kasumio.assessment.judge;

/**
 * Isolated Code Execution Judge Interface.
 * 
 * candidate code is executed through isolated sandboxes or remote execution engines (e.g. Judge0).
 * Never directly executed in the application host process in production.
 */
public interface CodeJudge {

    JudgeVerdict execute(JudgeSubmissionRequest request);

    boolean isAvailable();

    String getJudgeName();
}
