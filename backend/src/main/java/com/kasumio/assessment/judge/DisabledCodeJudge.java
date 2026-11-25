package com.kasumio.assessment.judge;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Default safe fallback CodeJudge that is active when no external judge is configured.
 */
@Component
public class DisabledCodeJudge implements CodeJudge {

    private static final Logger log = LoggerFactory.getLogger(DisabledCodeJudge.class);

    @Override
    public JudgeVerdict execute(JudgeSubmissionRequest request) {
        log.info("Code execution requested while CodeJudge is disabled.");
        return JudgeVerdict.disabled(
                "Code execution engine is disabled or not configured in this environment. External isolated judge required."
        );
    }

    @Override
    public boolean isAvailable() {
        return false;
    }

    @Override
    public String getJudgeName() {
        return "DisabledCodeJudge";
    }
}
