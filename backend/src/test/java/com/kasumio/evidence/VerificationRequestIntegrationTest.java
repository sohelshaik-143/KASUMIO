package com.kasumio.evidence;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.auth.dto.RegisterRequest;
import com.kasumio.evidence.dto.EvidenceRequest;
import com.kasumio.evidence.dto.VerificationActionRequest;
import com.kasumio.opportunity.OpportunityStatus;
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

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class VerificationRequestIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private EvidenceRepository evidenceRepository;

    @Autowired
    private VerificationRequestRepository verificationRequestRepository;

    private String registerAndGetToken(String email, Role role, String name, String orgName) throws Exception {
        RegisterRequest req = new RegisterRequest(email, "password123", role, name, null, orgName);
        String res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(res).get("token").asText();
    }

    private long createEvidence(String studentToken, Long skillId, String title, String url) throws Exception {
        EvidenceRequest req = new EvidenceRequest(
                skillId,
                title,
                "Demonstrating verified capability.",
                url,
                EvidenceType.PROJECT
        );
        String res = mockMvc.perform(post("/api/evidence")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(res).get("id").asLong();
    }

    private long createAndPublishOpportunity(String recruiterToken, String title, Long reqSkillId) throws Exception {
        OpportunityRequest req = new OpportunityRequest(
                title,
                "Description of role",
                OpportunityType.JOB,
                "Remote",
                WorkType.REMOTE,
                List.of(new SkillRequirementDto(reqSkillId, SkillRequirementType.REQUIRED))
        );
        String res = mockMvc.perform(post("/api/opportunities")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        long oppId = objectMapper.readTree(res).get("id").asLong();

        mockMvc.perform(post("/api/opportunities/" + oppId + "/publish")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk());
        return oppId;
    }

    @Test
    @DisplayName("Feature 01 Extension: Contextual Lightweight Verification, Expiration, Prioritization, and Provenance Flow")
    void testContextualVerificationFlow() throws Exception {
        Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElseThrow();
        Skill reactSkill = skillRepository.findByNameIgnoreCase("React").orElseThrow();

        // 1. Register Recruiters
        String recruiterToken1 = registerAndGetToken("lead_recruiter@tech.com", Role.RECRUITER, "Lead Recruiter", "Tech Corp");
        String recruiterToken2 = registerAndGetToken("other_recruiter@other.com", Role.RECRUITER, "Other Recruiter", "Other Corp");

        // 2. Register Student & create evidence
        String studentToken = registerAndGetToken("candidate@university.edu", Role.STUDENT, "Student Alice", null);
        long javaEvId = createEvidence(studentToken, javaSkill.getId(), "Java Concurrent Server", "https://github.com/alice/java-server");
        long reactEvId = createEvidence(studentToken, reactSkill.getId(), "React Portfolio UI", "https://github.com/alice/react-ui");

        // 3. Recruiter 1 creates & publishes opportunity requiring Java
        long oppId = createAndPublishOpportunity(recruiterToken1, "Java Platform Engineer", javaSkill.getId());

        // 4. Discover candidate alias
        String matchesRes = mockMvc.perform(get("/api/opportunities/" + oppId + "/matches")
                        .header("Authorization", "Bearer " + recruiterToken1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String candidateAlias = objectMapper.readTree(matchesRes).get(0).get("candidateAlias").asText();

        // 5. Anti-Mass-Verification Guard: No verification requests exist initially
        mockMvc.perform(get("/api/recruiter/verifications")
                        .header("Authorization", "Bearer " + recruiterToken1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // 6. Recruiter cannot request verification for unrelated evidence (React evidence for Java role -> 400 Bad Request)
        mockMvc.perform(post("/api/opportunities/" + oppId + "/matches/" + candidateAlias + "/evidence/" + reactEvId + "/verification-request")
                        .header("Authorization", "Bearer " + recruiterToken1))
                .andExpect(status().isBadRequest());

        // 7. Recruiter 2 cannot request verification for Recruiter 1's opportunity -> 403 Forbidden
        mockMvc.perform(post("/api/opportunities/" + oppId + "/matches/" + candidateAlias + "/evidence/" + javaEvId + "/verification-request")
                        .header("Authorization", "Bearer " + recruiterToken2))
                .andExpect(status().isForbidden());

        // 8. Recruiter 1 intentionally requests verification for relevant Java evidence -> 201 Created
        String reqRes = mockMvc.perform(post("/api/opportunities/" + oppId + "/matches/" + candidateAlias + "/evidence/" + javaEvId + "/verification-request")
                        .header("Authorization", "Bearer " + recruiterToken1))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("REQUESTED"))
                .andExpect(jsonPath("$.candidateAlias").value(candidateAlias))
                .andExpect(jsonPath("$.evidenceTitle").value("Java Concurrent Server"))
                // Candidate Anonymity Check
                .andExpect(jsonPath("$.studentId").doesNotExist())
                .andExpect(jsonPath("$.email").doesNotExist())
                .andReturn()
                .getResponse()
                .getContentAsString();
        long verifReqId = objectMapper.readTree(reqRes).get("id").asLong();

        // 9. Duplicate active request -> 409 Conflict
        mockMvc.perform(post("/api/opportunities/" + oppId + "/matches/" + candidateAlias + "/evidence/" + javaEvId + "/verification-request")
                        .header("Authorization", "Bearer " + recruiterToken1))
                .andExpect(status().isConflict());

        // 10. Student sees "REQUESTED" status for their evidence
        mockMvc.perform(get("/api/student/evidence/verification-status")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.evidenceId == " + javaEvId + ")].verifications", hasSize(1)))
                .andExpect(jsonPath("$[?(@.evidenceId == " + javaEvId + ")].verifications[0].status").value("REQUESTED"))
                .andExpect(jsonPath("$[?(@.evidenceId == " + javaEvId + ")].verifications[0].opportunityTitle").value("Java Platform Engineer"));

        // 11. Recruiter Verification Queue reflects pending request
        mockMvc.perform(get("/api/recruiter/verifications")
                        .header("Authorization", "Bearer " + recruiterToken1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(verifReqId))
                .andExpect(jsonPath("$[0].status").value("REQUESTED"))
                .andExpect(jsonPath("$[0].candidateAlias").value(candidateAlias));

        // 12. Recruiter 2 cannot view or verify Recruiter 1's request -> 403/404
        mockMvc.perform(get("/api/recruiter/verifications/" + verifReqId)
                        .header("Authorization", "Bearer " + recruiterToken2))
                .andExpect(status().isForbidden());

        // 13. Recruiter 1 reviews and verifies the request with optional comment
        VerificationActionRequest verifyAction = new VerificationActionRequest("Code demonstrated high-performance thread safety.");
        mockMvc.perform(post("/api/recruiter/verifications/" + verifReqId + "/verify")
                        .header("Authorization", "Bearer " + recruiterToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyAction)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("VERIFIED"))
                .andExpect(jsonPath("$.recruiterComment").value("Code demonstrated high-performance thread safety."));

        // 14. Student sees "VERIFIED" status (without private recruiter notes)
        mockMvc.perform(get("/api/student/evidence/verification-status")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.evidenceId == " + javaEvId + ")].verifications[0].status").value("VERIFIED"))
                .andExpect(jsonPath("$[?(@.evidenceId == " + javaEvId + ")].verifications[0].recruiterComment").doesNotExist());

        // 15. Original evidence remains completely intact and untampered
        Evidence originalEvidence = evidenceRepository.findById(javaEvId).orElseThrow();
        assertEquals("Java Concurrent Server", originalEvidence.getTitle());
        assertEquals("Demonstrating verified capability.", originalEvidence.getDescription());

        // 16. Test Rejection flow on React evidence for a React opportunity
        long reactOppId = createAndPublishOpportunity(recruiterToken1, "Frontend Engineer", reactSkill.getId());
        String req2Res = mockMvc.perform(post("/api/opportunities/" + reactOppId + "/matches/" + candidateAlias + "/evidence/" + reactEvId + "/verification-request")
                        .header("Authorization", "Bearer " + recruiterToken1))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        long verifReq2Id = objectMapper.readTree(req2Res).get("id").asLong();

        mockMvc.perform(post("/api/recruiter/verifications/" + verifReq2Id + "/reject")
                        .header("Authorization", "Bearer " + recruiterToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerificationActionRequest("Repository link was incomplete."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));

        // 17. Test Expiration logic (7 days threshold)
        VerificationRequest oldReq = verificationRequestRepository.findById(verifReq2Id).orElseThrow();
        oldReq.setStatus(VerificationStatus.REQUESTED);
        oldReq.setRequestedAt(Instant.now().minus(8, ChronoUnit.DAYS));
        verificationRequestRepository.saveAndFlush(oldReq);

        mockMvc.perform(get("/api/recruiter/verifications/" + verifReq2Id)
                        .header("Authorization", "Bearer " + recruiterToken1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EXPIRED"));

        // Expired request is NOT treated as verified
        mockMvc.perform(get("/api/student/evidence/verification-status")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.evidenceId == " + reactEvId + ")].verifications[0].status").value("EXPIRED"));
    }
}
