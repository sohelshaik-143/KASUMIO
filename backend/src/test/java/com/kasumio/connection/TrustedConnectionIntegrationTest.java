package com.kasumio.connection;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.auth.dto.RegisterRequest;
import com.kasumio.connection.dto.ConnectionConsentRequest;
import com.kasumio.connection.dto.ConnectionRequestDto;
import com.kasumio.evidence.EvidenceType;
import com.kasumio.evidence.dto.EvidenceRequest;
import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.SkillRequirementType;
import com.kasumio.opportunity.WorkType;
import com.kasumio.opportunity.dto.OpportunityRequest;
import com.kasumio.opportunity.dto.SkillRequirementDto;
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
public class TrustedConnectionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SkillRepository skillRepository;

    private String registerAndGetToken(String email, Role role, String name, Long orgId) throws Exception {
        RegisterRequest req = new RegisterRequest(email, "password123", role, name, orgId);
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
                "Demonstrating practical backend capability.",
                url,
                EvidenceType.PROJECT
        );
        mockMvc.perform(post("/api/evidence")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    private Long createAndPublishOpportunity(String recruiterToken, Long skillId, String title) throws Exception {
        OpportunityRequest oppReq = new OpportunityRequest(
                title,
                "Hands-on development role with demonstrable evidence.",
                OpportunityType.JOB,
                "Remote",
                WorkType.REMOTE,
                List.of(new SkillRequirementDto(skillId, SkillRequirementType.REQUIRED))
        );

        String createRes = mockMvc.perform(post("/api/opportunities")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oppReq)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long oppId = objectMapper.readTree(createRes).get("id").asLong();

        mockMvc.perform(post("/api/opportunities/" + oppId + "/publish")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk());

        return oppId;
    }

    @Test
    @DisplayName("Feature 02: End-to-End Trusted Connection with Strict Granular Consent and Zero Prior Identity Leakage")
    void testEndToEndTrustedConnectionFlow() throws Exception {
        Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElseThrow();

        // 1. Setup Student with Evidence
        String studentToken = registerAndGetToken("alice.student@university.edu", Role.STUDENT, "Alice Candidate", null);
        addEvidence(studentToken, javaSkill.getId(), "Core Java Engine", "https://github.com/alice/engine");

        // 2. Setup Recruiter and Opportunity
        String recruiterToken = registerAndGetToken("recruiter@acme.io", Role.RECRUITER, "Bob Recruiter", null);
        Long oppId = createAndPublishOpportunity(recruiterToken, javaSkill.getId(), "Backend Systems Engineer");

        // 3. Recruiter Discovers Matched Candidate (Anonymous)
        String matchesRes = mockMvc.perform(get("/api/opportunities/" + oppId + "/matches")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].candidateAlias", startsWith("KSM-CAND-")))
                .andExpect(jsonPath("$[0].connectionStatus").doesNotExist())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String candidateAlias = objectMapper.readTree(matchesRes).get(0).get("candidateAlias").asText();

        // 4. Recruiter Expresses Interest & Requests Trusted Connection
        ConnectionRequestDto requestDto = new ConnectionRequestDto("We loved your Java Engine repository!");
        String connRes = mockMvc.perform(post("/api/opportunities/" + oppId + "/candidates/" + candidateAlias + "/connect")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.candidateAlias", is(candidateAlias)))
                .andExpect(jsonPath("$.recruiterNote", is("We loved your Java Engine repository!")))
                .andExpect(jsonPath("$.disclosedProfile").doesNotExist()) // Crucial: Zero identity disclosure before consent!
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long connectionId = objectMapper.readTree(connRes).get("id").asLong();

        // 5. Verify Candidate Match Now Displays PENDING Connection Status to Recruiter
        mockMvc.perform(get("/api/opportunities/" + oppId + "/matches")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].connectionStatus", is("PENDING")))
                .andExpect(jsonPath("$[0].connectionId", is(connectionId.intValue())));

        // 6. Student Views Incoming Connection Requests
        String studentConnsRes = mockMvc.perform(get("/api/student/connections")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(connectionId.intValue())))
                .andExpect(jsonPath("$[0].opportunityTitle", is("Backend Systems Engineer")))
                .andExpect(jsonPath("$[0].recruiterNote", is("We loved your Java Engine repository!")))
                .andExpect(jsonPath("$[0].status", is("PENDING")))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // 7. Student Accepts with Granular Consent (Shares Name and Email, but Keeps Bio and University Hidden)
        ConnectionConsentRequest consent = new ConnectionConsentRequest(
                true,  // shareFullName
                true,  // shareEmail
                false, // shareBio (NOT shared)
                false, // shareUniversity (NOT shared)
                false, // shareGraduationYear (NOT shared)
                "Excited to discuss the systems engineer role!"
        );

        mockMvc.perform(post("/api/student/connections/" + connectionId + "/accept")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(consent)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")))
                .andExpect(jsonPath("$.shareFullName", is(true)))
                .andExpect(jsonPath("$.shareEmail", is(true)))
                .andExpect(jsonPath("$.shareBio", is(false)))
                .andExpect(jsonPath("$.customMessage", is("Excited to discuss the systems engineer role!")));

        // 8. Recruiter Views Connection & Receives ONLY Consented Professional Info
        mockMvc.perform(get("/api/recruiter/connections/" + connectionId)
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")))
                .andExpect(jsonPath("$.disclosedProfile.fullName", is("Alice Candidate")))
                .andExpect(jsonPath("$.disclosedProfile.email", is("alice.student@university.edu")))
                .andExpect(jsonPath("$.disclosedProfile.customMessage", is("Excited to discuss the systems engineer role!")))
                .andExpect(jsonPath("$.disclosedProfile.bio").doesNotExist()) // Omitted by privacy gate!
                .andExpect(jsonPath("$.disclosedProfile.university").doesNotExist()); // Omitted by privacy gate!
    }

    @Test
    @DisplayName("Feature 02: Student Declines Connection Request Without Penalty or Reputation Impact")
    void testStudentDeclinesConnection() throws Exception {
        Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElseThrow();

        String studentToken = registerAndGetToken("declining.student@university.edu", Role.STUDENT, "David Student", null);
        addEvidence(studentToken, javaSkill.getId(), "Java Project", "https://github.com/david/java");

        String recruiterToken = registerAndGetToken("recruiter2@corp.io", Role.RECRUITER, "Recruiter 2", null);
        Long oppId = createAndPublishOpportunity(recruiterToken, javaSkill.getId(), "Java Dev");

        String matchesRes = mockMvc.perform(get("/api/opportunities/" + oppId + "/matches")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String candidateAlias = objectMapper.readTree(matchesRes).get(0).get("candidateAlias").asText();

        // Recruiter requests connection
        String connRes = mockMvc.perform(post("/api/opportunities/" + oppId + "/candidates/" + candidateAlias + "/connect")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long connId = objectMapper.readTree(connRes).get("id").asLong();

        // Student declines
        mockMvc.perform(post("/api/student/connections/" + connId + "/decline")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DECLINED")));

        // Recruiter inspects: Profile is NOT disclosed
        mockMvc.perform(get("/api/recruiter/connections/" + connId)
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DECLINED")))
                .andExpect(jsonPath("$.disclosedProfile").doesNotExist());

        // Matching engine continues to match the student objectively
        mockMvc.perform(get("/api/opportunities/" + oppId + "/matches")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].connectionStatus", is("DECLINED")));
    }

    @Test
    @DisplayName("Feature 02: Multi-Recruiter Independence — Simultaneous Requests Handled Independently")
    void testMultiRecruiterIndependence() throws Exception {
        Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElseThrow();

        String studentToken = registerAndGetToken("multi.student@university.edu", Role.STUDENT, "Multi Student", null);
        addEvidence(studentToken, javaSkill.getId(), "Java App", "https://github.com/multi/java");

        String recTokenA = registerAndGetToken("recA@firm.com", Role.RECRUITER, "Recruiter A", null);
        String recTokenB = registerAndGetToken("recB@firm.com", Role.RECRUITER, "Recruiter B", null);
        String recTokenC = registerAndGetToken("recC@firm.com", Role.RECRUITER, "Recruiter C", null);

        Long oppA = createAndPublishOpportunity(recTokenA, javaSkill.getId(), "Role A");
        Long oppB = createAndPublishOpportunity(recTokenB, javaSkill.getId(), "Role B");
        Long oppC = createAndPublishOpportunity(recTokenC, javaSkill.getId(), "Role C");

        String matchA = mockMvc.perform(get("/api/opportunities/" + oppA + "/matches").header("Authorization", "Bearer " + recTokenA))
                .andReturn().getResponse().getContentAsString();
        String alias = objectMapper.readTree(matchA).get(0).get("candidateAlias").asText();

        // 3 Recruiters request connection
        String resA = mockMvc.perform(post("/api/opportunities/" + oppA + "/candidates/" + alias + "/connect").header("Authorization", "Bearer " + recTokenA))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        Long idA = objectMapper.readTree(resA).get("id").asLong();

        String resB = mockMvc.perform(post("/api/opportunities/" + oppB + "/candidates/" + alias + "/connect").header("Authorization", "Bearer " + recTokenB))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        Long idB = objectMapper.readTree(resB).get("id").asLong();

        String resC = mockMvc.perform(post("/api/opportunities/" + oppC + "/candidates/" + alias + "/connect").header("Authorization", "Bearer " + recTokenC))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        Long idC = objectMapper.readTree(resC).get("id").asLong();

        // Student accepts A, declines C, leaves B pending
        mockMvc.perform(post("/api/student/connections/" + idA + "/accept").header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ConnectionConsentRequest(true, true, false, false, false, null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")));

        mockMvc.perform(post("/api/student/connections/" + idC + "/decline").header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DECLINED")));

        // Verify independent states
        mockMvc.perform(get("/api/recruiter/connections/" + idA).header("Authorization", "Bearer " + recTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")))
                .andExpect(jsonPath("$.disclosedProfile.fullName", is("Multi Student")));

        mockMvc.perform(get("/api/recruiter/connections/" + idB).header("Authorization", "Bearer " + recTokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.disclosedProfile").doesNotExist());

        mockMvc.perform(get("/api/recruiter/connections/" + idC).header("Authorization", "Bearer " + recTokenC))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DECLINED")))
                .andExpect(jsonPath("$.disclosedProfile").doesNotExist());
    }

    @Test
    @DisplayName("Feature 02: Strict Security & Cross-Tenant RBAC Authorization Checks")
    void testSecurityAndAuthorizationGuards() throws Exception {
        Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElseThrow();

        String studentToken1 = registerAndGetToken("s1@uni.edu", Role.STUDENT, "Student One", null);
        String studentToken2 = registerAndGetToken("s2@uni.edu", Role.STUDENT, "Student Two", null);
        addEvidence(studentToken1, javaSkill.getId(), "Java Project 1", "https://github.com/s1/java");

        String recToken1 = registerAndGetToken("r1@corp.com", Role.RECRUITER, "Recruiter One", null);
        String recToken2 = registerAndGetToken("r2@corp.com", Role.RECRUITER, "Recruiter Two", null);
        Long oppId1 = createAndPublishOpportunity(recToken1, javaSkill.getId(), "Role 1");

        String matchRes = mockMvc.perform(get("/api/opportunities/" + oppId1 + "/matches").header("Authorization", "Bearer " + recToken1))
                .andReturn().getResponse().getContentAsString();
        String alias1 = objectMapper.readTree(matchRes).get(0).get("candidateAlias").asText();

        String connRes = mockMvc.perform(post("/api/opportunities/" + oppId1 + "/candidates/" + alias1 + "/connect").header("Authorization", "Bearer " + recToken1))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        Long connId = objectMapper.readTree(connRes).get("id").asLong();

        // 1. Recruiter 2 attempts to connect on Opportunity 1 (owned by Recruiter 1) -> 403 Forbidden
        mockMvc.perform(post("/api/opportunities/" + oppId1 + "/candidates/" + alias1 + "/connect").header("Authorization", "Bearer " + recToken2))
                .andExpect(status().isForbidden());

        // 2. Recruiter 2 attempts to view Recruiter 1's connection record -> 403 Forbidden
        mockMvc.perform(get("/api/recruiter/connections/" + connId).header("Authorization", "Bearer " + recToken2))
                .andExpect(status().isForbidden());

        // 3. Student 2 attempts to accept Student 1's connection request -> 403 Forbidden
        mockMvc.perform(post("/api/student/connections/" + connId + "/accept").header("Authorization", "Bearer " + studentToken2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ConnectionConsentRequest(true, true, false, false, false, null))))
                .andExpect(status().isForbidden());

        // 4. Student 2 attempts to decline Student 1's connection request -> 403 Forbidden
        mockMvc.perform(post("/api/student/connections/" + connId + "/decline").header("Authorization", "Bearer " + studentToken2))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Feature 02: Revocation of Active Connection Ceases Identity Disclosure")
    void testConnectionRevocation() throws Exception {
        Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElseThrow();

        String studentToken = registerAndGetToken("revoking.student@uni.edu", Role.STUDENT, "Revoking Student", null);
        addEvidence(studentToken, javaSkill.getId(), "Java Project", "https://github.com/rev/java");

        String recToken = registerAndGetToken("rec.rev@corp.com", Role.RECRUITER, "Recruiter Rev", null);
        Long oppId = createAndPublishOpportunity(recToken, javaSkill.getId(), "Role Rev");

        String matchRes = mockMvc.perform(get("/api/opportunities/" + oppId + "/matches").header("Authorization", "Bearer " + recToken))
                .andReturn().getResponse().getContentAsString();
        String alias = objectMapper.readTree(matchRes).get(0).get("candidateAlias").asText();

        String connRes = mockMvc.perform(post("/api/opportunities/" + oppId + "/candidates/" + alias + "/connect").header("Authorization", "Bearer " + recToken))
                .andReturn().getResponse().getContentAsString();
        Long connId = objectMapper.readTree(connRes).get("id").asLong();

        // Student accepts
        mockMvc.perform(post("/api/student/connections/" + connId + "/accept").header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ConnectionConsentRequest(true, true, true, true, true, null))))
                .andExpect(status().isOk());

        // Student later revokes connection
        mockMvc.perform(post("/api/student/connections/" + connId + "/cancel").header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());

        // Recruiter fetches connection -> Status is CANCELLED and identity is ceased (disclosedProfile is null)
        mockMvc.perform(get("/api/recruiter/connections/" + connId).header("Authorization", "Bearer " + recToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CANCELLED")))
                .andExpect(jsonPath("$.disclosedProfile").doesNotExist());
    }

    @Test
    @DisplayName("Feature 02: Full Mutual Interest Flow — Student Interest + Recruiter Interest = Connected")
    void testMutualInterestFlow() throws Exception {
        Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElseThrow();

        // 1. Student registers & adds evidence
        String studentToken = registerAndGetToken("mutual.candidate@uni.edu", Role.STUDENT, "Mutual Candidate", null);
        addEvidence(studentToken, javaSkill.getId(), "Full Stack App", "https://github.com/mutual/app");

        // 2. Recruiter publishes opportunity
        String recToken = registerAndGetToken("hiring@techcorp.io", Role.RECRUITER, "Hiring Manager", null);
        Long oppId = createAndPublishOpportunity(recToken, javaSkill.getId(), "Full Stack Engineer");

        // 3. Student expresses interest in Opportunity (Feature 01)
        mockMvc.perform(post("/api/opportunities/" + oppId + "/interest")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());

        // 4. Recruiter discovers candidate with hasExpressedInterest = true
        String matchesRes = mockMvc.perform(get("/api/opportunities/" + oppId + "/matches")
                        .header("Authorization", "Bearer " + recToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].hasExpressedInterest", is(true)))
                .andReturn().getResponse().getContentAsString();

        String alias = objectMapper.readTree(matchesRes).get(0).get("candidateAlias").asText();

        // 5. Recruiter expresses interest / requests connection (Feature 02)
        String connRes = mockMvc.perform(post("/api/opportunities/" + oppId + "/candidates/" + alias + "/connect")
                        .header("Authorization", "Bearer " + recToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ConnectionRequestDto("Great evidence portfolio!"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andReturn().getResponse().getContentAsString();

        Long connId = objectMapper.readTree(connRes).get("id").asLong();

        // 6. Student accepts with consent
        mockMvc.perform(post("/api/student/connections/" + connId + "/accept")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ConnectionConsentRequest(true, true, true, false, false, "Looking forward!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")));

        // 7. Recruiter views consented profile
        mockMvc.perform(get("/api/recruiter/connections/" + connId)
                        .header("Authorization", "Bearer " + recToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")))
                .andExpect(jsonPath("$.disclosedProfile.fullName", is("Mutual Candidate")))
                .andExpect(jsonPath("$.disclosedProfile.email", is("mutual.candidate@uni.edu")))
                .andExpect(jsonPath("$.disclosedProfile.bio").doesNotExist());
    }

    @Test
    @DisplayName("Feature 02: Duplicate Interest and Duplicate Connection Handling")
    void testDuplicateInterestAndConnectionHandling() throws Exception {
        Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElseThrow();

        String studentToken = registerAndGetToken("dup.student@uni.edu", Role.STUDENT, "Dup Student", null);
        addEvidence(studentToken, javaSkill.getId(), "Java Repo", "https://github.com/dup/repo");

        String recToken = registerAndGetToken("dup.rec@firm.io", Role.RECRUITER, "Dup Recruiter", null);
        Long oppId = createAndPublishOpportunity(recToken, javaSkill.getId(), "Duplicate Test Job");

        // Express interest once -> 200 OK
        mockMvc.perform(post("/api/opportunities/" + oppId + "/interest")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());

        // Express interest again -> 409 Conflict
        mockMvc.perform(post("/api/opportunities/" + oppId + "/interest")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isConflict());

        String matchesRes = mockMvc.perform(get("/api/opportunities/" + oppId + "/matches")
                        .header("Authorization", "Bearer " + recToken))
                .andReturn().getResponse().getContentAsString();
        String alias = objectMapper.readTree(matchesRes).get(0).get("candidateAlias").asText();

        // Connect once -> 201 Created
        mockMvc.perform(post("/api/opportunities/" + oppId + "/candidates/" + alias + "/connect")
                        .header("Authorization", "Bearer " + recToken))
                .andExpect(status().isCreated());

        // Connect again while pending -> 409 Conflict
        mockMvc.perform(post("/api/opportunities/" + oppId + "/candidates/" + alias + "/connect")
                        .header("Authorization", "Bearer " + recToken))
                .andExpect(status().isConflict());
    }
}
