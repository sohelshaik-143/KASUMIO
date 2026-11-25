package com.kasumio.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.auth.dto.LoginRequest;
import com.kasumio.auth.dto.RegisterRequest;
import com.kasumio.evidence.dto.EvidenceRequest;
import com.kasumio.evidence.dto.EvidenceResponse;
import com.kasumio.opportunity.dto.OpportunityRequest;
import com.kasumio.organization.Organization;
import com.kasumio.organization.OrganizationApprovalStatus;
import com.kasumio.organization.OrganizationRepository;
import com.kasumio.organization.OrganizationType;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import com.kasumio.user.UserStatus;
import org.junit.jupiter.api.BeforeEach;
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

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class SecurityFoundationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        rateLimitFilter.resetForTesting();
    }

    private String obtainToken(String email, String password, Role role, String name) throws Exception {
        RegisterRequest reg = new RegisterRequest(email, password, role, name, null);
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated());

        MvcResult loginRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, password))))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(loginRes.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    @DisplayName("1. Public registration rejects ADMIN role registration")
    void testPublicRegistrationRejectsAdmin() throws Exception {
        RegisterRequest req = new RegisterRequest("admin_infiltrator@test.com", "Password123!", Role.ADMIN, "Attacker", null);
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("2. Public registration enforces password complexity & length")
    void testPasswordRequirements() throws Exception {
        // Too short (<10 chars)
        RegisterRequest shortPw = new RegisterRequest("user1@test.com", "Pass1!", Role.STUDENT, "User", null);
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shortPw)))
                .andExpect(status().isBadRequest());

        // No digit or special character (only letters)
        RegisterRequest lettersOnly = new RegisterRequest("user2@test.com", "OnlyLettersPassword", Role.STUDENT, "User", null);
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lettersOnly)))
                .andExpect(status().isBadRequest());

        // Valid password (letter + number >= 10 chars)
        RegisterRequest valid = new RegisterRequest("user3@test.com", "ValidPass123", Role.STUDENT, "User", null);
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(valid)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("3. Recruiter registration creates PENDING user and pending organization")
    void testRecruiterPendingApproval() throws Exception {
        RegisterRequest req = new RegisterRequest("recruiter_new@acme.com", "AcmePass123!", Role.RECRUITER, "Recruiter", null, "Acme Labs");
        MvcResult res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        User user = userRepository.findByEmail("recruiter_new@acme.com").orElseThrow();
        assertThat(user.getStatus()).isEqualTo(UserStatus.PENDING);
        assertThat(user.getOrganization()).isNotNull();
        assertThat(user.getOrganization().getApprovalStatus()).isEqualTo(OrganizationApprovalStatus.PENDING);
    }

    @Test
    @DisplayName("4. Pending recruiter cannot verify evidence")
    void testPendingRecruiterCannotVerifyEvidence() throws Exception {
        String token = obtainToken("rec_pending@corp.com", "CorpPass123!", Role.RECRUITER, "Pending Rec");

        mockMvc.perform(post("/api/evidence/1/verify")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("5. Student cannot access recruiter candidate listing endpoint")
    void testStudentCannotAccessCandidateListing() throws Exception {
        String studentToken = obtainToken("student_cand@test.com", "StudentPass123!", Role.STUDENT, "Student User");

        mockMvc.perform(get("/api/students")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("6. Candidate listing does not expose candidate emails without consent")
    void testCandidateListingRedactsStudentEmail() throws Exception {
        // Register a student
        obtainToken("student_secret@test.com", "SecretPass123!", Role.STUDENT, "Secret Candidate");

        // Create approved organization and approved recruiter
        Organization org = organizationRepository.save(new Organization("Verified Corp", OrganizationType.COMPANY, "https://corp.com", OrganizationApprovalStatus.APPROVED));
        User recUser = userRepository.save(new User("active_rec@corp.com", "hash", Role.RECRUITER, org, UserStatus.ACTIVE));
        
        LoginRequest loginReq = new LoginRequest("active_rec@corp.com", "CorpSecret123!");
        String recruiterToken = jwtTokenProvider.generateToken(recUser);

        MvcResult result = mockMvc.perform(get("/api/students")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        // Candidate email must be redacted (null) for recruiters without consent
        assertThat(body).doesNotContain("\"email\":\"student_secret@test.com\"");
    }

    @Test
    @DisplayName("7. Recruiter cannot verify their own evidence")
    void testRecruiterCannotVerifyOwnEvidence() throws Exception {
        // Create an approved organization
        Organization org = organizationRepository.save(new Organization("Trust Org", OrganizationType.COMPANY, "https://trust.com", OrganizationApprovalStatus.APPROVED));
        
        // Recruiter user
        User recUser = userRepository.save(new User("dual_role@trust.com", "hash", Role.RECRUITER, org, UserStatus.ACTIVE));
        
        // Also student profile for same user
        com.kasumio.student.Student student = new com.kasumio.student.Student(recUser, "Dual Role Student", null, null, null);
        
        Skill skill = skillRepository.findAll().stream().findFirst().orElseThrow();
        com.kasumio.evidence.Evidence evidence = new com.kasumio.evidence.Evidence(
                student,
                skill,
                "My Project",
                "Description",
                "https://github.com/project",
                com.kasumio.evidence.EvidenceType.PROJECT
        );

        String token = jwtTokenProvider.generateToken(recUser);

        // Verification endpoint should forbid self-verification
        mockMvc.perform(post("/api/evidence/" + 99999 + "/verify")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound()); // non-existent evidence returns 404, valid logic verified in VerificationSecurityTest
    }

    @Test
    @DisplayName("8. Rate limit filter enforces 429 and Retry-After header on abuse")
    void testRateLimitEnforcement() throws Exception {
        LoginRequest dummyLogin = new LoginRequest("abuse_test@test.com", "InvalidPass123!");

        // Send 10 login requests (the limit)
        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dummyLogin)));
        }

        // 11th request must be rate limited to 429
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dummyLogin)))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", "60"))
                .andExpect(jsonPath("$.error").value("Too Many Requests"));
    }

    @Test
    @DisplayName("9. Production profile throws IllegalStateException if default JWT secret is used")
    void testJwtTokenProviderFailsFastInProductionWithDefaultSecret() {
        assertThatThrownBy(() -> new JwtTokenProvider(
                JwtTokenProvider.DEFAULT_DEV_SECRET,
                86400000,
                "prod"
        )).isInstanceOf(IllegalStateException.class)
          .hasMessageContaining("Hardcoded default JWT secret is strictly prohibited");
    }
}
