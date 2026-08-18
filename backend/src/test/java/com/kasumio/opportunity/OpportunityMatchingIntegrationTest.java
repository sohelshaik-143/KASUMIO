package com.kasumio.opportunity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.auth.dto.RegisterRequest;
import com.kasumio.evidence.EvidenceType;
import com.kasumio.evidence.dto.EvidenceRequest;
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
public class OpportunityMatchingIntegrationTest {

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
                "Demonstrating practical capability.",
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
    @DisplayName("Feature 01: Complete Opportunity Lifecycle, Validation, Deterministic Matching, Anonymity, and Student Interest")
    void testOpportunityMatchingCompleteFlow() throws Exception {
        // Retrieve taxonomy skills
        Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElseThrow();
        Skill springSkill = skillRepository.findByNameIgnoreCase("Spring Boot").orElseThrow();
        Skill mysqlSkill = skillRepository.findByNameIgnoreCase("MySQL").orElseThrow();
        Skill reactSkill = skillRepository.findByNameIgnoreCase("React").orElseThrow();
        Skill gitSkill = skillRepository.findByNameIgnoreCase("Git & Version Control").orElseThrow();

        // 1. Register Recruiters
        String recruiterTokenA = registerAndGetToken("recruiterA@kasumio.io", Role.RECRUITER, "Recruiter A", null);
        String recruiterTokenB = registerAndGetToken("recruiterB@kasumio.io", Role.RECRUITER, "Recruiter B", null);

        // 2. Register Students
        // Student 1 (Strong Java, Strong Spring Boot, Single MySQL) -> Qualifies for (Java, Spring Boot, MySQL, React) (3/4 = 75% >= 50%)
        String studentToken1 = registerAndGetToken("student1@university.edu", Role.STUDENT, "Alice Candidate", null);
        addEvidence(studentToken1, javaSkill.getId(), "Core Java Multi-threading Project", "https://github.com/alice/java-multithread");
        addEvidence(studentToken1, javaSkill.getId(), "Java Design Patterns Repo", "https://github.com/alice/java-patterns");
        addEvidence(studentToken1, springSkill.getId(), "Spring Boot REST Service", "https://github.com/alice/spring-rest");
        addEvidence(studentToken1, springSkill.getId(), "Spring Security JWT Service", "https://github.com/alice/spring-sec");
        addEvidence(studentToken1, mysqlSkill.getId(), "Database Schema Optimizer", "https://github.com/alice/db-schema");

        // Student 2 (Only React evidence) -> Fails 50% threshold on backend required skills (0/3 required = 0% < 50%)
        String studentToken2 = registerAndGetToken("student2@university.edu", Role.STUDENT, "Bob Frontend", null);
        addEvidence(studentToken2, reactSkill.getId(), "React Dashboard App", "https://github.com/bob/react-dash");

        // Student 3 (No evidence) -> Fails threshold
        String studentToken3 = registerAndGetToken("student3@university.edu", Role.STUDENT, "Charlie NoEvidence", null);

        // 3. Recruiter creates DRAFT opportunity with Required: Java, Spring Boot, MySQL; Preferred: Git
        OpportunityRequest createReq = new OpportunityRequest(
                "Backend Engineering Internship",
                "Building resilient backend services with Spring Boot and MySQL.",
                OpportunityType.INTERNSHIP,
                "Bangalore / Remote",
                WorkType.HYBRID,
                List.of(
                        new SkillRequirementDto(javaSkill.getId(), SkillRequirementType.REQUIRED),
                        new SkillRequirementDto(springSkill.getId(), SkillRequirementType.REQUIRED),
                        new SkillRequirementDto(mysqlSkill.getId(), SkillRequirementType.REQUIRED),
                        new SkillRequirementDto(gitSkill.getId(), SkillRequirementType.PREFERRED)
                )
        );

        String oppRes = mockMvc.perform(post("/api/opportunities")
                        .header("Authorization", "Bearer " + recruiterTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.requiredSkills", hasSize(3)))
                .andExpect(jsonPath("$.preferredSkills", hasSize(1)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        long oppId = objectMapper.readTree(oppRes).get("id").asLong();

        // 4. Validation: Cannot publish opportunity without at least one REQUIRED skill
        OpportunityRequest invalidReq = new OpportunityRequest(
                "Invalid Opportunity",
                "Description",
                OpportunityType.JOB,
                "Remote",
                WorkType.REMOTE,
                List.of(new SkillRequirementDto(gitSkill.getId(), SkillRequirementType.PREFERRED))
        );
        String invalidOppRes = mockMvc.perform(post("/api/opportunities")
                        .header("Authorization", "Bearer " + recruiterTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        long invalidOppId = objectMapper.readTree(invalidOppRes).get("id").asLong();

        mockMvc.perform(post("/api/opportunities/" + invalidOppId + "/publish")
                        .header("Authorization", "Bearer " + recruiterTokenA))
                .andExpect(status().isBadRequest());

        // 5. Security: Recruiter B cannot modify or publish Recruiter A's opportunity
        mockMvc.perform(post("/api/opportunities/" + oppId + "/publish")
                        .header("Authorization", "Bearer " + recruiterTokenB))
                .andExpect(status().isForbidden());

        // 6. Recruiter A publishes opportunity
        mockMvc.perform(post("/api/opportunities/" + oppId + "/publish")
                        .header("Authorization", "Bearer " + recruiterTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        // 7. Matching: Recruiter A discovers anonymous matches
        String matchesRes = mockMvc.perform(get("/api/opportunities/" + oppId + "/matches")
                        .header("Authorization", "Bearer " + recruiterTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].candidateAlias", startsWith("KSM-CAND-")))
                .andExpect(jsonPath("$[0].whySurfaced").isNotEmpty())
                .andExpect(jsonPath("$[0].hasExpressedInterest").value(false))
                // Strict Candidate Anonymity Check: No student identity returned!
                .andExpect(jsonPath("$[0].studentId").doesNotExist())
                .andExpect(jsonPath("$[0].userId").doesNotExist())
                .andExpect(jsonPath("$[0].name").doesNotExist())
                .andExpect(jsonPath("$[0].fullName").doesNotExist())
                .andExpect(jsonPath("$[0].email").doesNotExist())
                .andExpect(jsonPath("$[0].university").doesNotExist())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String candidateAlias = objectMapper.readTree(matchesRes).get(0).get("candidateAlias").asText();

        // 8. Security: Recruiter B cannot view matches for Recruiter A's opportunity
        mockMvc.perform(get("/api/opportunities/" + oppId + "/matches")
                        .header("Authorization", "Bearer " + recruiterTokenB))
                .andExpect(status().isForbidden());

        // 9. Recruiter A inspects anonymous candidate evidence
        mockMvc.perform(get("/api/opportunities/" + oppId + "/matches/" + candidateAlias + "/evidence")
                        .header("Authorization", "Bearer " + recruiterTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(5)))
                // Verify no personal identity in evidence inspection
                .andExpect(jsonPath("$[0].studentId").doesNotExist())
                .andExpect(jsonPath("$[0].email").doesNotExist());

        // 10. Student 1 discovers relevant opportunity via /api/student/opportunities
        mockMvc.perform(get("/api/student/opportunities")
                        .header("Authorization", "Bearer " + studentToken1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(oppId))
                .andExpect(jsonPath("$[0].whyRelevant", containsString("Java")))
                .andExpect(jsonPath("$[0].hasExpressedInterest").value(false));

        // 11. Student 3 (No evidence) -> sees 0 relevant opportunities
        mockMvc.perform(get("/api/student/opportunities")
                        .header("Authorization", "Bearer " + studentToken3))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // 12. Student 1 expresses interest
        mockMvc.perform(post("/api/opportunities/" + oppId + "/interest")
                        .header("Authorization", "Bearer " + studentToken1))
                .andExpect(status().isOk());

        // 13. Duplicate active interest returns HTTP 409 Conflict
        mockMvc.perform(post("/api/opportunities/" + oppId + "/interest")
                        .header("Authorization", "Bearer " + studentToken1))
                .andExpect(status().isConflict());

        // 14. Recruiter match response now reflects expressed interest
        mockMvc.perform(get("/api/opportunities/" + oppId + "/matches")
                        .header("Authorization", "Bearer " + recruiterTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].hasExpressedInterest").value(true))
                .andExpect(jsonPath("$[0].interestStatus").value("INTERESTED"));

        // 15. Student 1 withdraws interest
        mockMvc.perform(delete("/api/opportunities/" + oppId + "/interest")
                        .header("Authorization", "Bearer " + studentToken1))
                .andExpect(status().isNoContent());

        // 16. Recruiter closes opportunity
        mockMvc.perform(post("/api/opportunities/" + oppId + "/close")
                        .header("Authorization", "Bearer " + recruiterTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));

        // 17. Closed opportunity cannot be used for active matching
        mockMvc.perform(get("/api/opportunities/" + oppId + "/matches")
                        .header("Authorization", "Bearer " + recruiterTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
