package com.kasumio.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.agent.dto.ApproveAndExecuteRequest;
import com.kasumio.agent.dto.RecruiterIntentRequest;
import com.kasumio.agent.dto.RecruiterPolicyDto;
import com.kasumio.auth.dto.RegisterRequest;
import com.kasumio.connection.dto.ConnectionConsentRequest;
import com.kasumio.evidence.EvidenceType;
import com.kasumio.evidence.dto.EvidenceRequest;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import com.kasumio.user.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecruiterAgentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SkillRepository skillRepository;

    private String registerAndGetToken(String email, Role role, String name) throws Exception {
        RegisterRequest req = new RegisterRequest(email, "password123", role, name, null);
        String res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(res).get("token").asText();
    }

    private void addEvidence(String token, Long skillId, String title, String url) throws Exception {
        EvidenceRequest req = new EvidenceRequest(
                skillId,
                title,
                "Demonstrating backend capability with real code artifact.",
                url,
                EvidenceType.PROJECT
        );
        mockMvc.perform(post("/api/evidence")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Autonomous Recruiter Agent: Natural Language Intent -> Discovery -> One-Approval Execution -> Student Consent")
    void testAutonomousRecruiterAgentFullWorkflow() throws Exception {
        Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElseThrow();
        Skill springSkill = skillRepository.findByNameIgnoreCase("Spring Boot").orElseThrow();
        Skill mysqlSkill = skillRepository.findByNameIgnoreCase("MySQL").orElseThrow();
        Skill reactSkill = skillRepository.findByNameIgnoreCase("React").orElseThrow();

        // 1. Register Recruiter
        String recruiterToken = registerAndGetToken("recruiter@kasumio-hire.com", Role.RECRUITER, "Tech Recruiter");

        // 2. Register Students
        // Alice: Java, Spring Boot, MySQL (Strong Match)
        String aliceToken = registerAndGetToken("alice@university.edu", Role.STUDENT, "Alice Engineer");
        addEvidence(aliceToken, javaSkill.getId(), "E-Commerce Microservice", "https://github.com/alice/ecommerce-service");
        addEvidence(aliceToken, springSkill.getId(), "Spring Security Auth Gateway", "https://github.com/alice/spring-gateway");
        addEvidence(aliceToken, mysqlSkill.getId(), "Order Database Schema & Indexing", "https://github.com/alice/order-db");

        // Bob: React only (No backend skills)
        String bobToken = registerAndGetToken("bob@university.edu", Role.STUDENT, "Bob Frontend");
        addEvidence(bobToken, reactSkill.getId(), "Portfolio UI App", "https://github.com/bob/portfolio-ui");

        // 3. Recruiter expresses natural-language intent
        String prompt = "I want to create a Java backend internship for students with Spring Boot and MySQL experience. Prioritize people who have built real projects and can work remotely.";
        RecruiterIntentRequest intentReq = new RecruiterIntentRequest(prompt);

        String jobRes = mockMvc.perform(post("/api/recruiter/agent/intent")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(intentReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.jobId", startsWith("KSM-JOB-")))
                .andExpect(jsonPath("$.status", is("READY_FOR_REVIEW")))
                .andExpect(jsonPath("$.parsedIntent.roleTitle", containsString("Backend")))
                .andExpect(jsonPath("$.parsedIntent.workType", is("REMOTE")))
                .andExpect(jsonPath("$.parsedIntent.opportunityType", is("INTERNSHIP")))
                .andExpect(jsonPath("$.parsedIntent.requiredSkills", hasItems("Java", "Spring Boot", "MySQL")))
                .andExpect(jsonPath("$.candidatesMatchedCount", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.recommendations[0].candidateAlias", startsWith("KSM-CAND-")))
                .andExpect(jsonPath("$.recommendations[0].readinessScore", greaterThanOrEqualTo(50)))
                .andExpect(jsonPath("$.recommendations[0].whyRecommended", notNullValue()))
                .andExpect(jsonPath("$.recommendations[0].personalizedMessage", containsString("Java")))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String jobId = objectMapper.readTree(jobRes).get("jobId").asText();
        String candidateAlias = objectMapper.readTree(jobRes).get("recommendations").get(0).get("candidateAlias").asText();

        // 4. Inspect Job Details via GET
        mockMvc.perform(get("/api/recruiter/agent/jobs/" + jobId)
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobId", is(jobId)))
                .andExpect(jsonPath("$.status", is("READY_FOR_REVIEW")));

        // 5. One-Approval Execution
        ApproveAndExecuteRequest approveReq = new ApproveAndExecuteRequest();
        approveReq.setApprovedAliases(List.of(candidateAlias));
        approveReq.setPublishImmediately(true);

        mockMvc.perform(post("/api/recruiter/agent/jobs/" + jobId + "/approve-and-execute")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COMPLETED")))
                .andExpect(jsonPath("$.outreachSentCount", is(1)))
                .andExpect(jsonPath("$.opportunityId", notNullValue()));

        // 6. Student Side Intact: Alice checks incoming connections
        String studentConnsRes = mockMvc.perform(get("/api/student/connections")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status", is("PENDING")))
                .andExpect(jsonPath("$[0].recruiterNote", containsString("Java")))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long connectionId = objectMapper.readTree(studentConnsRes).get(0).get("id").asLong();

        // 7. Student accepts connection with granular consent
        ConnectionConsentRequest consentReq = new ConnectionConsentRequest();
        consentReq.setShareFullName(true);
        consentReq.setShareEmail(true);
        consentReq.setShareBio(true);

        mockMvc.perform(post("/api/student/connections/" + connectionId + "/accept")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(consentReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")));

        // 8. Recruiter inspects consented candidate profile
        mockMvc.perform(get("/api/recruiter/connections/" + connectionId)
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.disclosedProfile.fullName", is("Alice Engineer")))
                .andExpect(jsonPath("$.disclosedProfile.email", is("alice@university.edu")));
    }

    @Test
    @DisplayName("Recruiter Policy and Audit Logging")
    void testRecruiterPolicyAndAudit() throws Exception {
        String recruiterToken = registerAndGetToken("recruiter-policy@kasumio.com", Role.RECRUITER, "Policy Recruiter");

        // 1. Get default policy
        mockMvc.perform(get("/api/recruiter/agent/policies")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maxDailyConnections", is(25)))
                .andExpect(jsonPath("$.minReadinessThreshold", is(50)));

        // 2. Update policy
        RecruiterPolicyDto updatedPolicy = new RecruiterPolicyDto(40, 60, true, false);
        mockMvc.perform(put("/api/recruiter/agent/policies")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedPolicy)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maxDailyConnections", is(40)))
                .andExpect(jsonPath("$.minReadinessThreshold", is(60)))
                .andExpect(jsonPath("$.requireVerifiedEvidence", is(true)));

        // 3. Inspect audit logs
        mockMvc.perform(get("/api/recruiter/agent/audit-logs")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].actionType", is("POLICY_UPDATED")));
    }

    @Test
    @DisplayName("Test Frontend React Intent Parsing and Workflow")
    void testFrontendIntentWorkflow() throws Exception {
        String recruiterToken = registerAndGetToken("rec_front@kasumio-hire.com", Role.RECRUITER, "Frontend Recruiter");
        String prompt = "Looking for a Frontend React intern with TypeScript and TailwindCSS experience. Candidates must have verified web project evidence. Hybrid in Bangalore.";
        RecruiterIntentRequest intentReq = new RecruiterIntentRequest(prompt);

        mockMvc.perform(post("/api/recruiter/agent/intent")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(intentReq)))
                .andExpect(status().isCreated());
    }
}
