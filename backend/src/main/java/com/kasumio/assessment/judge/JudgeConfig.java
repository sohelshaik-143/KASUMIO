package com.kasumio.assessment.judge;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JudgeConfig {

    private static final Logger log = LoggerFactory.getLogger(JudgeConfig.class);

    @Bean
    @Primary
    @ConditionalOnMissingBean(CodeJudge.class)
    public CodeJudge codeJudge(
            @Value("${kasumio.assessment.judge.type:disabled}") String judgeType,
            @Value("${kasumio.assessment.judge.url:}") String judgeUrl,
            @Value("${kasumio.assessment.judge.api-key:}") String apiKey,
            ObjectMapper objectMapper) {

        if ("external".equalsIgnoreCase(judgeType) && judgeUrl != null && !judgeUrl.isBlank()) {
            log.info("Configuring ExternalHttpCodeJudge against {}", judgeUrl);
            return new ExternalHttpCodeJudge(judgeUrl, apiKey, objectMapper);
        } else if ("fake".equalsIgnoreCase(judgeType)) {
            log.info("Configuring FakeCodeJudge for testing.");
            return new FakeCodeJudge();
        }

        log.info("CodeJudge is configured as DisabledCodeJudge by default.");
        return new DisabledCodeJudge();
    }
}
