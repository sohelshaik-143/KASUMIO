package com.kasumio.assessment.judge;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;

/**
 * Isolated External HTTP Code Judge Adapter (Judge0 compatible).
 * Runs candidate code in a remote isolated container with strict resource limits.
 */
public class ExternalHttpCodeJudge implements CodeJudge {

    private static final Logger log = LoggerFactory.getLogger(ExternalHttpCodeJudge.class);

    private final String judgeBaseUrl;
    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    // Standard Judge0 language IDs
    private static final Map<String, Integer> LANGUAGE_IDS = Map.ofEntries(
            Map.entry("java", 62),
            Map.entry("python", 71),
            Map.entry("py", 71),
            Map.entry("javascript", 63),
            Map.entry("js", 63),
            Map.entry("typescript", 74),
            Map.entry("ts", 74),
            Map.entry("cpp", 54),
            Map.entry("c++", 54),
            Map.entry("c", 50),
            Map.entry("go", 60),
            Map.entry("rust", 73),
            Map.entry("kotlin", 78)
    );

    public ExternalHttpCodeJudge(String judgeBaseUrl, String apiKey, ObjectMapper objectMapper) {
        this.judgeBaseUrl = judgeBaseUrl != null ? judgeBaseUrl.replaceAll("/+$", "") : "";
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Override
    public JudgeVerdict execute(JudgeSubmissionRequest request) {
        if (!isAvailable()) {
            return JudgeVerdict.disabled("External code judge endpoint is not configured or unavailable.");
        }

        String lang = request.getLanguage().toLowerCase().trim();
        Integer languageId = LANGUAGE_IDS.get(lang);
        if (languageId == null) {
            return JudgeVerdict.error(JudgeStatus.COMPILATION_ERROR, "Unsupported programming language: " + request.getLanguage());
        }

        try {
            Map<String, Object> payload = Map.of(
                    "source_code", Base64.getEncoder().encodeToString(request.getSourceCode().getBytes(StandardCharsets.UTF_8)),
                    "language_id", languageId,
                    "stdin", request.getStdin() != null ? Base64.getEncoder().encodeToString(request.getStdin().getBytes(StandardCharsets.UTF_8)) : "",
                    "expected_output", request.getExpectedOutput() != null ? Base64.getEncoder().encodeToString(request.getExpectedOutput().getBytes(StandardCharsets.UTF_8)) : "",
                    "cpu_time_limit", Math.max(1, request.getTimeLimitMs() / 1000.0),
                    "memory_limit", Math.max(16384, request.getMemoryLimitKb()),
                    "max_file_size", 4096
            );

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest.Builder httpReqBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(judgeBaseUrl + "/submissions?base64_encoded=true&wait=true"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(12))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody));

            if (apiKey != null && !apiKey.isBlank()) {
                httpReqBuilder.header("X-Auth-Token", apiKey);
            }

            HttpResponse<String> response = httpClient.send(httpReqBuilder.build(), HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200 && response.statusCode() != 201) {
                log.error("External judge returned error status {}: {}", response.statusCode(), response.body());
                return JudgeVerdict.error(JudgeStatus.SYSTEM_ERROR, "External judge service returned HTTP " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            int statusId = root.path("status").path("id").asInt(0);

            String stdout = decodeBase64(root.path("stdout").asText(null));
            String stderr = decodeBase64(root.path("stderr").asText(null));
            String compileOutput = decodeBase64(root.path("compile_output").asText(null));
            long timeMs = Math.round(root.path("time").asDouble(0.0) * 1000.0);
            long memoryKb = root.path("memory").asLong(0);

            JudgeStatus status;
            boolean passed = false;

            switch (statusId) {
                case 3: // Accepted
                    status = JudgeStatus.PASSED;
                    passed = true;
                    break;
                case 4: // Wrong Answer
                    status = JudgeStatus.FAILED;
                    break;
                case 5: // Time Limit Exceeded
                    status = JudgeStatus.TIME_LIMIT_EXCEEDED;
                    break;
                case 6: // Compilation Error
                    status = JudgeStatus.COMPILATION_ERROR;
                    break;
                case 7: // Runtime Error (SIGSEGV)
                case 8: // Runtime Error (SIGXFSZ)
                case 9: // Runtime Error (SIGFPE)
                case 10: // Runtime Error (SIGABRT)
                case 11: // Runtime Error (NZEC)
                case 12: // Runtime Error (Other)
                    status = JudgeStatus.RUNTIME_ERROR;
                    break;
                default:
                    status = (statusId == 0) ? JudgeStatus.SYSTEM_ERROR : JudgeStatus.FAILED;
            }

            return new JudgeVerdict(status, passed, stdout, stderr, compileOutput, timeMs, memoryKb, "Evaluated by External Judge");

        } catch (Exception e) {
            log.error("Failed to evaluate code with external judge: {}", e.getMessage(), e);
            return JudgeVerdict.error(JudgeStatus.SYSTEM_ERROR, "Judge execution failed: " + e.getMessage());
        }
    }

    private String decodeBase64(String encoded) {
        if (encoded == null || encoded.isBlank() || "null".equals(encoded)) return "";
        try {
            return new String(Base64.getDecoder().decode(encoded.trim()), StandardCharsets.UTF_8);
        } catch (Exception e) {
            return encoded;
        }
    }

    @Override
    public boolean isAvailable() {
        return judgeBaseUrl != null && !judgeBaseUrl.isBlank();
    }

    @Override
    public String getJudgeName() {
        return "ExternalHttpCodeJudge (" + judgeBaseUrl + ")";
    }
}
