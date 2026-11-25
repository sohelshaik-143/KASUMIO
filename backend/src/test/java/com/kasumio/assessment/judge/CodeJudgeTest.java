package com.kasumio.assessment.judge;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class CodeJudgeTest {

    @Test
    @DisplayName("1. DisabledCodeJudge returns safe disabled status")
    void testDisabledJudge() {
        DisabledCodeJudge judge = new DisabledCodeJudge();
        assertThat(judge.isAvailable()).isFalse();
        assertThat(judge.getJudgeName()).isEqualTo("DisabledCodeJudge");

        JudgeSubmissionRequest req = new JudgeSubmissionRequest("java", "class Solution {}", "1 2", "3", 2000, 256000, 4096);
        JudgeVerdict verdict = judge.execute(req);

        assertThat(verdict.getStatus()).isEqualTo(JudgeStatus.DISABLED);
        assertThat(verdict.isPassed()).isFalse();
        assertThat(verdict.getMessage()).contains("disabled");
    }

    @Test
    @DisplayName("2. FakeCodeJudge evaluates sample submissions accurately")
    void testFakeJudge() {
        FakeCodeJudge judge = new FakeCodeJudge();
        assertThat(judge.isAvailable()).isTrue();

        // Normal passing code
        JudgeSubmissionRequest passReq = new JudgeSubmissionRequest("python", "print('42')", "", "42", 2000, 256000, 4096);
        JudgeVerdict passVerdict = judge.execute(passReq);
        assertThat(passVerdict.getStatus()).isEqualTo(JudgeStatus.PASSED);
        assertThat(passVerdict.isPassed()).isTrue();
        assertThat(passVerdict.getStdout()).isEqualTo("42");

        // Failing code
        JudgeSubmissionRequest failReq = new JudgeSubmissionRequest("python", "FAIL_TEST", "", "42", 2000, 256000, 4096);
        JudgeVerdict failVerdict = judge.execute(failReq);
        assertThat(failVerdict.getStatus()).isEqualTo(JudgeStatus.FAILED);
        assertThat(failVerdict.isPassed()).isFalse();

        // Compilation error simulation
        JudgeSubmissionRequest compileReq = new JudgeSubmissionRequest("java", "COMPILATION_ERROR", "", "42", 2000, 256000, 4096);
        JudgeVerdict compileVerdict = judge.execute(compileReq);
        assertThat(compileVerdict.getStatus()).isEqualTo(JudgeStatus.COMPILATION_ERROR);
    }

    @Test
    @DisplayName("3. ExternalHttpCodeJudge returns disabled if URL is missing")
    void testExternalJudgeWithoutUrl() {
        ExternalHttpCodeJudge judge = new ExternalHttpCodeJudge("", "", new ObjectMapper());
        assertThat(judge.isAvailable()).isFalse();

        JudgeSubmissionRequest req = new JudgeSubmissionRequest("java", "code", "", "", 2000, 256000, 4096);
        JudgeVerdict verdict = judge.execute(req);
        assertThat(verdict.getStatus()).isEqualTo(JudgeStatus.DISABLED);
    }

    @Test
    @DisplayName("4. JudgeConfig instantiates appropriate CodeJudge based on property")
    void testJudgeConfig() {
        JudgeConfig config = new JudgeConfig();
        ObjectMapper mapper = new ObjectMapper();

        CodeJudge disabled = config.codeJudge("disabled", "", "", mapper);
        assertThat(disabled).isInstanceOf(DisabledCodeJudge.class);

        CodeJudge fake = config.codeJudge("fake", "", "", mapper);
        assertThat(fake).isInstanceOf(FakeCodeJudge.class);

        CodeJudge external = config.codeJudge("external", "http://localhost:2358", "key", mapper);
        assertThat(external).isInstanceOf(ExternalHttpCodeJudge.class);
    }
}
