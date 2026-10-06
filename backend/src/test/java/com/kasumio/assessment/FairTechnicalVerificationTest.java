package com.kasumio.assessment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.assessment.dto.*;
import com.kasumio.auth.dto.LoginRequest;
import com.kasumio.auth.dto.RegisterRequest;
import com.kasumio.opportunity.Opportunity;
import com.kasumio.opportunity.OpportunityRepository;
import com.kasumio.opportunity.OpportunityStatus;
import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.WorkType;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class FairTechnicalVerificationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CodeQualityAndComplexityAnalyzer codeAnalyzer;

    @Autowired
    private FairIntegrityAnalysisService integrityService;

    @Autowired
    private FairEvidenceGraphService evidenceGraphService;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private CandidateQuestionHistoryRepository questionHistoryRepository;

    private String getAuthToken(String email, String password, Role role, String name) throws Exception {
        RegisterRequest registerReq = new RegisterRequest(email, password, role, name, null);
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)));

        LoginRequest loginReq = new LoginRequest(email, password);
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> map = objectMapper.readValue(res.getResponse().getContentAsString(), Map.class);
        return (String) map.get("token");
    }

    @Test
    @DisplayName("Code Analyzer estimates time/space complexity and detects demonstrated concepts")
    void testCodeAnalyzerEstimatesComplexityAndConcepts() {
        String javaCode = """
                public class Solution {
                    public int maxSubArray(int[] nums) {
                        int maxSum = nums[0];
                        int currentSum = 0;
                        for (int i = 0; i < nums.length; i++) {
                            currentSum += nums[i];
                            if (currentSum > maxSum) {
                                maxSum = currentSum;
                            }
                            if (currentSum < 0) {
                                currentSum = 0;
                            }
                        }
                        return maxSum;
                    }
                }
                """;

        CodeQualityAndComplexityAnalyzer.CodeAnalysisResult result = codeAnalyzer.analyze(javaCode, "java", null);

        assertThat(result.timeComplexity).isEqualTo("O(N)");
        assertThat(result.spaceComplexity).isEqualTo("O(1)");
        assertThat(result.demonstratedConcepts).contains(
                "Arrays / Sequence Data Structures",
                "Iterative Loop Control Flow",
                "Conditional Branching Logic",
                "Method / Function Decomposition"
        );
        assertThat(result.codeQualityScore).isGreaterThanOrEqualTo(75);
    }

    @Test
    @DisplayName("Structural code similarity ignores standard loop boilerplate to prevent false positives")
    void testNormalizedSimilarityIgnoresBoilerplate() {
        String code1 = """
                for (int i = 0; i < arr.length; i++) {
                    sum += arr[i];
                }
                """;
        String code2 = """
                for (int idx = 0; idx < numbers.length; idx++) {
                    total += numbers[idx];
                }
                """;

        double rawSim = codeAnalyzer.calculateStructuralSimilarity(code1, code2);
        // Standard syntax boilerplate does NOT trigger a high-similarity plagiarism flag (< 0.60)
        assertThat(rawSim).isLessThan(0.60);
    }

    @Test
    @DisplayName("Fast solve time with passing tests is credited as High Proficiency, never cheating")
    void testSkillVsCheatingPrinciple() {
        FairIntegrityAnalysisService.IntegrityTelemetryInput input = new FairIntegrityAnalysisService.IntegrityTelemetryInput();
        input.durationSeconds = 25L; // fast solve
        input.totalQuestions = 1;
        input.solvedQuestions = 1;
        input.totalTestCases = 10;
        input.testCasesPassed = 10;
        input.totalFocusChanges = 1;
        input.totalPasteEvents = 0;

        FairIntegrityAnalysisService.IntegrityEvaluationReport report = integrityService.evaluate(input);

        assertThat(report.status).isEqualTo(AssessmentIntegrityStatus.NORMAL);
        assertThat(report.observations).anyMatch(obs -> obs.contains("Rapid problem-solving") && obs.contains("strong algorithmic fluency"));
        assertThat(report.requiresHumanReview).isFalse();
    }

    @Test
    @DisplayName("Self-Assessment vs Demonstrated comparison provides constructive feedback")
    void testSelfAssessmentVsDemonstratedConstructiveNarrative() {
        String narrative = evidenceGraphService.buildConstructiveNarrative(
                SelfAssessmentLevel.EXCELLENT,
                DemonstratedLevel.MEDIUM,
                8,
                10
        );

        assertThat(narrative).contains("Your assessment results currently demonstrate strong technical fundamentals");
    }

    @Test
    @DisplayName("E2E Fair Technical Verification flow with Self-Assessment, Telemetry, and Recruiter Decision")
    void testE2EFairTechnicalVerificationFlow() throws Exception {
        // 1. Setup recruiter and opportunity
        User recruiterUser = userRepository.save(new User("lead.recruiter@fairverif.io", "pass123", Role.RECRUITER, null));
        Opportunity opp = new Opportunity(
                recruiterUser,
                "Senior Java Engineer",
                "Core Java Backend Role",
                OpportunityType.JOB,
                "San Francisco, CA",
                WorkType.HYBRID
        );
        opp.setStatus(OpportunityStatus.PUBLISHED);
        opportunityRepository.save(opp);

        String candidateToken = getAuthToken("candidate.test@fairverif.io", "pass123", Role.STUDENT, "Jordan Reed");
        String recruiterToken = getAuthToken("recruiter.review@fairverif.io", "pass123", Role.RECRUITER, "Elena Vance");

        // 2. Candidate gets assessment blueprint
        MvcResult assmResult = mockMvc.perform(get("/api/assessments/opportunity/" + opp.getId())
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andReturn();

        AssessmentDto assessmentDto = objectMapper.readValue(assmResult.getResponse().getContentAsString(), AssessmentDto.class);
        Long assessmentId = assessmentDto.getId();

        // 3. Candidate starts assessment with SelfAssessmentLevel.EXCELLENT & transparency confirmation
        StartAssessmentRequest startReq = new StartAssessmentRequest(SelfAssessmentLevel.EXCELLENT, true);
        MvcResult attemptResult = mockMvc.perform(post("/api/assessments/" + assessmentId + "/start")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(startReq)))
                .andExpect(status().isOk())
                .andReturn();

        AssessmentAttemptDto attemptDto = objectMapper.readValue(attemptResult.getResponse().getContentAsString(), AssessmentAttemptDto.class);
        Long attemptId = attemptDto.getId();
        assertThat(attemptDto.getSelfAssessmentLevel()).isEqualTo("EXCELLENT");

        // 4. Candidate submits answer with non-punitive telemetry
        MvcResult nextQResult = mockMvc.perform(get("/api/assessments/attempts/" + attemptId + "/next-question")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andReturn();

        QuestionDetailDto qDetail = objectMapper.readValue(nextQResult.getResponse().getContentAsString(), QuestionDetailDto.class);

        SubmitQuestionRequest submitReq = new SubmitQuestionRequest(
                qDetail.getId(),
                "java",
                "public class Solution { public int solve() { return 42; } }",
                qDetail.getOptions() != null && !qDetail.getOptions().isEmpty() ? qDetail.getOptions().get(0).getId() : null
        );
        submitReq.setFocusChangeCount(2);
        submitReq.setPasteCount(1);
        submitReq.setTimeSpentSeconds(45L);

        mockMvc.perform(post("/api/assessments/attempts/" + attemptId + "/submit")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitReq)))
                .andExpect(status().isOk());

        // 5. Complete attempt
        MvcResult completeResult = mockMvc.perform(post("/api/assessments/attempts/" + attemptId + "/complete")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andReturn();

        AssessmentResultDto resultDto = objectMapper.readValue(completeResult.getResponse().getContentAsString(), AssessmentResultDto.class);
        assertThat(resultDto.getSelfAssessmentLevel()).isEqualTo("EXCELLENT");
        assertThat(resultDto.getIntegrityStatus()).isNotNull();

        // 6. Recruiter records decision: VERIFIED
        RecruiterDecisionRequest decisionReq = new RecruiterDecisionRequest(RecruiterDecisionType.VERIFIED, "Demonstrated clean coding practices.");
        MvcResult decisionResult = mockMvc.perform(post("/api/assessments/attempts/" + attemptId + "/recruiter-decision")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decisionReq)))
                .andExpect(status().isOk())
                .andReturn();

        AssessmentResultDto verifiedResult = objectMapper.readValue(decisionResult.getResponse().getContentAsString(), AssessmentResultDto.class);
        assertThat(verifiedResult.getRecruiterDecision()).isEqualTo("VERIFIED");
        assertThat(verifiedResult.getRecruiterNotes()).isEqualTo("Demonstrated clean coding practices.");
    }
}
