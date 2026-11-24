package com.kasumio.evidence;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.auth.dto.RegisterRequest;
import com.kasumio.evidence.dto.EvidenceRequest;
import com.kasumio.opportunity.Opportunity;
import com.kasumio.opportunity.OpportunityRepository;
import com.kasumio.opportunity.OpportunityStatus;
import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.WorkType;
import com.kasumio.organization.Organization;
import com.kasumio.organization.OrganizationApprovalStatus;
import com.kasumio.organization.OrganizationRepository;
import com.kasumio.organization.OrganizationType;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
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

    @Autowired
    private VerificationRequestRepository verificationRequestRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EvidenceRepository evidenceRepository;

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
    @DisplayName("Verification Security: Trust, cross-org isolation, self-verify guard, and unauthenticated write guard")
    void testVerificationAuthorizationFlow() throws Exception {
        // 1. Create Approved Organizations
        Organization techCorp = organizationRepository.save(new Organization("TechCorp Global", OrganizationType.COMPANY, "https://techcorp.example.com", OrganizationApprovalStatus.APPROVED));
        Organization rivalCorp = organizationRepository.save(new Organization("RivalCorp Inc", OrganizationType.COMPANY, "https://rivalcorp.example.com", OrganizationApprovalStatus.APPROVED));

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

        // 5. Cross-org / Unrequested Check: TechCorp recruiter tries to verify before any request was made -> 403 Forbidden
        String orgRecruiterToken = registerAndGetToken("recruiter@techcorp.com", Role.RECRUITER, "TechCorp Lead", techCorp.getId());
        mockMvc.perform(post("/api/evidence/" + evidenceId + "/verify")
                        .header("Authorization", "Bearer " + orgRecruiterToken))
                .andExpect(status().isForbidden());

        // Create a formal VerificationRequest for TechCorp
        User techRecruiter = userRepository.findByEmail("recruiter@techcorp.com").orElseThrow();
        User studentUser = userRepository.findByEmail("student_v@example.com").orElseThrow();
        Student student = studentRepository.findByUser(studentUser).orElseThrow();
        Evidence evidence = evidenceRepository.findById(evidenceId).orElseThrow();

        Opportunity opp = new Opportunity(
                techRecruiter,
                "Backend Engineer",
                "Great role",
                OpportunityType.JOB,
                "Remote",
                WorkType.REMOTE
        );
        opp.setStatus(OpportunityStatus.PUBLISHED);
        opp = opportunityRepository.save(opp);

        VerificationRequest vr = new VerificationRequest(opp, evidence, techRecruiter, student);
        verificationRequestRepository.save(vr);

        // 6. Cross-Org Verify Abuse: RivalCorp recruiter attempts to verify evidence requested by TechCorp -> 403 Forbidden
        String rivalRecruiterToken = registerAndGetToken("recruiter@rivalcorp.com", Role.RECRUITER, "Rival Lead", rivalCorp.getId());
        mockMvc.perform(post("/api/evidence/" + evidenceId + "/verify")
                        .header("Authorization", "Bearer " + rivalRecruiterToken))
                .andExpect(status().isForbidden());

        // 7. Authorized: Recruiter belonging to TechCorp (the requesting org) verifies evidence -> 200 OK
        mockMvc.perform(post("/api/evidence/" + evidenceId + "/verify")
                        .header("Authorization", "Bearer " + orgRecruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.verification.organizationName").value("TechCorp Global"))
                .andExpect(jsonPath("$.verification.verifiedByUserEmail").value("recruiter@techcorp.com"));

        // 8. Duplicate verification attempt -> 409 Conflict
        mockMvc.perform(post("/api/evidence/" + evidenceId + "/verify")
                        .header("Authorization", "Bearer " + orgRecruiterToken))
                .andExpect(status().isConflict());

        // 9. Self-Verify Abuse Case: A recruiter attempts to verify evidence they own -> 403 Forbidden
        Evidence recruiterOwnedEvidence = new Evidence(
                student, // candidate with recruiter's user
                springSkill,
                "Recruiter Side Project",
                "Description",
                "https://github.com/project",
                EvidenceType.PROJECT
        );
        // Link evidence student user to techRecruiter
        Student recruiterStudent = studentRepository.save(new Student(techRecruiter, "Tech Recruiter Student", null, null, null));
        recruiterOwnedEvidence.setStudent(recruiterStudent);
        recruiterOwnedEvidence = evidenceRepository.save(recruiterOwnedEvidence);

        mockMvc.perform(post("/api/evidence/" + recruiterOwnedEvidence.getId() + "/verify")
                        .header("Authorization", "Bearer " + orgRecruiterToken))
                .andExpect(status().isForbidden());

        // 10. Unauthenticated write abuse: POST /api/discovery/candidates/discover requires authentication -> 401/403
        mockMvc.perform(post("/api/discovery/candidates/discover")
                        .param("term", "QuantumComputing")
                        .param("source", "abuse_test"))
                .andExpect(status().isUnauthorized());
    }
}
