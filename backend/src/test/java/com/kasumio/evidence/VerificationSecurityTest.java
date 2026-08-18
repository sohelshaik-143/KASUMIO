package com.kasumio.evidence;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.auth.dto.RegisterRequest;
import com.kasumio.evidence.dto.EvidenceRequest;
import com.kasumio.organization.Organization;
import com.kasumio.organization.OrganizationRepository;
import com.kasumio.organization.OrganizationType;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class VerificationSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

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

    @Test
    @DisplayName("6. Verification Security: Unauthorized verification rejected, valid org verification accepted")
    void testVerificationAuthorizationFlow() throws Exception {
        // 1. Create Organization
        Organization techCorp = organizationRepository.save(new Organization("TechCorp Global", OrganizationType.COMPANY, "https://techcorp.example.com"));

        // 2. Register Student & create evidence
        String studentToken = registerAndGetToken("student_v@example.com", Role.STUDENT, "Student Verifiable", null);
        Skill springSkill = skillRepository.findByNameIgnoreCase("Spring Boot").orElseThrow();

        EvidenceRequest evidenceReq = new EvidenceRequest(
                springSkill.getId(),
                "RESTful Authentication Microservice",
                "Clean Spring Security JWT implementation.",
                "https://github.com/student/auth-service",
                EvidenceType.PROJECT
        );

        String evidenceRes = mockMvc.perform(post("/api/evidence")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(evidenceReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.verified").value(false))
                .andReturn()
                .getResponse()
                .getContentAsString();

        long evidenceId = objectMapper.readTree(evidenceRes).get("id").asLong();

        // 3. Unauthorized: Student attempts to verify own evidence -> 403 Forbidden
        mockMvc.perform(post("/api/evidence/" + evidenceId + "/verify")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        // 4. Unauthorized: Recruiter without organization affiliation -> 403 Forbidden
        String unaffiliatedRecruiterToken = registerAndGetToken("unaffiliated@example.com", Role.RECRUITER, "Solo Recruiter", null);
        mockMvc.perform(post("/api/evidence/" + evidenceId + "/verify")
                        .header("Authorization", "Bearer " + unaffiliatedRecruiterToken))
                .andExpect(status().isForbidden());

        // 5. Authorized: Recruiter belonging to TechCorp verifies evidence -> 200 OK
        String orgRecruiterToken = registerAndGetToken("recruiter@techcorp.com", Role.RECRUITER, "TechCorp Lead", techCorp.getId());
        mockMvc.perform(post("/api/evidence/" + evidenceId + "/verify")
                        .header("Authorization", "Bearer " + orgRecruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.verification.organizationName").value("TechCorp Global"))
                .andExpect(jsonPath("$.verification.verifiedByUserEmail").value("recruiter@techcorp.com"));

        // 6. Duplicate verification attempt -> 409 Conflict
        mockMvc.perform(post("/api/evidence/" + evidenceId + "/verify")
                        .header("Authorization", "Bearer " + orgRecruiterToken))
                .andExpect(status().isConflict());

        // 7. Student dashboard now reflects exactly 1 verified evidence
        mockMvc.perform(get("/api/students/dashboard")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEvidenceCount").value(1))
                .andExpect(jsonPath("$.verifiedEvidenceCount").value(1));
    }
}
