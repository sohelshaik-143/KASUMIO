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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class AssessmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

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
        return "Bearer " + map.get("token");
    }

    @Test
    @DisplayName("Assessment Complete Lifecycle: Generate, Start, Run Code, Submit, Complete, and Leaderboard")
    void testAssessmentLifecycle() throws Exception {
        String recruiterToken = getAuthToken("recruiter@acme.com", "pass12345", Role.RECRUITER, "Rachel Recruiter");
        String studentToken = getAuthToken("bob@student.edu", "pass12345", Role.STUDENT, "Bob Developer");

        User recruiter = userRepository.findByEmail("recruiter@acme.com").orElseThrow();

        // 1. Create a published opportunity
        Opportunity opp = new Opportunity(
                recruiter,
                "Java Backend Engineer",
                "Building resilient microservices with Java, Spring Boot, and SQL",
                OpportunityType.JOB,
                "Bangalore",
                WorkType.REMOTE
        );
        opp.setStatus(OpportunityStatus.PUBLISHED);
        opp = opportunityRepository.save(opp);

        // 2. Get / Generate Assessment for Opportunity
        MvcResult oppAssessmentRes = mockMvc.perform(get("/api/assessments/opportunity/" + opp.getId())
                        .header("Authorization", studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value(containsString("Java Backend Engineer")))
                .andExpect(jsonPath("$.totalQuestions").isNumber())
                .andReturn();

        AssessmentDto assessmentDto = objectMapper.readValue(oppAssessmentRes.getResponse().getContentAsString(), AssessmentDto.class);
        Long assessmentId = assessmentDto.getId();

        // 3. Candidate starts assessment attempt
        MvcResult startAttemptRes = mockMvc.perform(post("/api/assessments/" + assessmentId + "/start")
                        .header("Authorization", studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andReturn();

        AssessmentAttemptDto attemptDto = objectMapper.readValue(startAttemptRes.getResponse().getContentAsString(), AssessmentAttemptDto.class);
        Long attemptId = attemptDto.getId();

        // 4. Fetch first adaptive question
        MvcResult nextQRes = mockMvc.perform(get("/api/assessments/attempts/" + attemptId + "/next-question")
                        .header("Authorization", studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.questionType").isNotEmpty())
                .andReturn();

        QuestionDetailDto questionDto = objectMapper.readValue(nextQRes.getResponse().getContentAsString(), QuestionDetailDto.class);

        // 5. Test Code Execution / Run Code if coding question
        if (questionDto.getQuestionType() == QuestionType.CODING) {
            String sampleJava = "import java.util.*;\npublic class Solution {\n public static void main(String[] args) {\n  System.out.println(3);\n }\n}";
            RunCodeRequest runReq = new RunCodeRequest("java", sampleJava, "apple banana apple");
            mockMvc.perform(post("/api/assessments/attempts/" + attemptId + "/questions/" + questionDto.getId() + "/run-code")
                            .header("Authorization", studentToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(runReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.compilationError").value(false));
        }

        // 6. Submit answer
        SubmitQuestionRequest subReq = new SubmitQuestionRequest();
        subReq.setQuestionId(questionDto.getId());
        if (questionDto.getQuestionType() == QuestionType.CODING) {
            subReq.setLanguage("java");
            subReq.setCode("import java.util.*;\npublic class Solution {\n public static void main(String[] args) {\n  Scanner s = new Scanner(System.in);\n  if(!s.hasNextLine()) { System.out.println(0); return; }\n  String[] words = s.nextLine().trim().split(\"\\\\s+\");\n  Map<String,Integer> m = new HashMap<>(); int mx = 0;\n  for(String w: words) { int c = m.getOrDefault(w,0)+1; m.put(w,c); mx = Math.max(mx,c); }\n  System.out.println(mx);\n }\n}");
        } else if (questionDto.getOptions() != null && !questionDto.getOptions().isEmpty()) {
            subReq.setSelectedOptionId(questionDto.getOptions().get(0).getId());
        }

        mockMvc.perform(post("/api/assessments/attempts/" + attemptId + "/submit")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(subReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.submissionId").isNumber())
                .andExpect(jsonPath("$.feedback").isNotEmpty());

        // 7. Complete Attempt
        mockMvc.perform(post("/api/assessments/attempts/" + attemptId + "/complete")
                        .header("Authorization", studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attemptId").value(attemptId))
                .andExpect(jsonPath("$.capabilityLevel").isNotEmpty())
                .andExpect(jsonPath("$.feedbackSummary").isNotEmpty());

        // 8. View Leaderboard
        mockMvc.perform(get("/api/leaderboard"))
                .andExpect(status().isOk());

        // 9. Recruiter inspects candidate assessment code & feedback
        mockMvc.perform(get("/api/assessments/opportunity/" + opp.getId() + "/candidate-results/" + attemptDto.getStudentId())
                        .header("Authorization", recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attemptId").value(attemptId))
                .andExpect(jsonPath("$.questionResults").isArray());
    }
}
