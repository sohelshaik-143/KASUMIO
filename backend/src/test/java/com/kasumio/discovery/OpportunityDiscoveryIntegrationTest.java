package com.kasumio.discovery;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.auth.dto.RegisterRequest;
import com.kasumio.discovery.dto.CareerWhatIfRequest;
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
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class OpportunityDiscoveryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private TechnologyNormalizationService normalizationService;

    @Autowired
    private DeterministicMatchScorer matchScorer;

    @Autowired
    private TechnologyCandidateService candidateService;

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
                "Demonstrating practical capability in production.",
                url,
                EvidenceType.PROJECT
        );
        mockMvc.perform(post("/api/evidence")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    private Long createAndPublishOpportunity(String recruiterToken, String title, OpportunityType type, WorkType workType,
                                             List<SkillRequirementDto> skills, String desc) throws Exception {
        OpportunityRequest oppReq = new OpportunityRequest(
                title,
                desc != null ? desc : "Building high performance systems with modern tech stack.",
                type,
                "San Francisco, CA",
                workType,
                skills
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
    @DisplayName("Technology Normalization: Broad diversity across ecosystem, aliases, and versions")
    void testBroadTechnologyDiversityNormalization() {
        // Programming Languages & Aliases
        assertTrue(normalizationService.resolve("JS").isPresent());
        assertEquals("JavaScript", normalizationService.resolve("JS").get().getName());

        assertTrue(normalizationService.resolve("TS").isPresent());
        assertEquals("TypeScript", normalizationService.resolve("TS").get().getName());

        assertTrue(normalizationService.resolve("Golang").isPresent());
        assertEquals("Go", normalizationService.resolve("Golang").get().getName());

        assertTrue(normalizationService.resolve("Rust").isPresent());

        // Frameworks
        assertTrue(normalizationService.resolve("FastAPI").isPresent());
        assertTrue(normalizationService.resolve("Django").isPresent());
        assertTrue(normalizationService.resolve("Next.js").isPresent());
        assertTrue(normalizationService.resolve("Spring Boot").isPresent());

        // Databases & Cloud/DevOps
        assertTrue(normalizationService.resolve("Postgres").isPresent());
        assertEquals("PostgreSQL", normalizationService.resolve("Postgres").get().getName());

        assertTrue(normalizationService.resolve("K8s").isPresent());
        assertEquals("Kubernetes", normalizationService.resolve("K8s").get().getName());

        assertTrue(normalizationService.resolve("Docker").isPresent());
        assertTrue(normalizationService.resolve("Redis").isPresent());
        assertTrue(normalizationService.resolve("AWS").isPresent());

        // AI / ML / Emerging
        assertTrue(normalizationService.resolve("PyTorch").isPresent());
        assertTrue(normalizationService.resolve("LangChain").isPresent());
        assertTrue(normalizationService.resolve("Pinecone").isPresent());
        assertTrue(normalizationService.resolve("RAG").isPresent());

        // Version awareness
        assertTrue(normalizationService.resolve("Java 17").isPresent());
        assertEquals("Java", normalizationService.resolve("Java 17").get().getName());

        assertTrue(normalizationService.resolve("Python 3.12").isPresent());
        assertEquals("Python", normalizationService.resolve("Python 3.12").get().getName());

        assertTrue(normalizationService.resolve("React 18").isPresent());
        assertEquals("React", normalizationService.resolve("React 18").get().getName());

        // Unknown technology candidate
        assertFalse(normalizationService.resolve("FutureFramework9000").isPresent());
    }

    @Test
    @DisplayName("Deterministic Match Score: 10 consecutive runs with identical inputs produce identical scores")
    void testDeterministicScoringConsistency() throws Exception {
        String recruiterToken = registerAndGetToken("recruiter_score@kasumio.com", Role.RECRUITER, "Recruiter Determinism", null);
        String studentToken = registerAndGetToken("student_score@kasumio.com", Role.STUDENT, "Student Determinism", null);

        Skill java = skillRepository.findByNameIgnoreCase("Java").orElseThrow();
        Skill spring = skillRepository.findByNameIgnoreCase("Spring Boot").orElseThrow();

        // Add 2 evidence items for Java
        addEvidence(studentToken, java.getId(), "Java Microservice Repo", "https://github.com/test/java-repo");
        addEvidence(studentToken, java.getId(), "Java API Deployed", "https://api.test.com");

        Long oppId = createAndPublishOpportunity(recruiterToken, "Backend Engineer", OpportunityType.JOB, WorkType.REMOTE,
                List.of(
                        new SkillRequirementDto(java.getId(), java.getName(), java.getCategory(), SkillRequirementType.REQUIRED),
                        new SkillRequirementDto(spring.getId(), spring.getName(), spring.getCategory(), SkillRequirementType.PREFERRED)
                ),
                "Looking for Java and Spring Boot engineer."
        );

        // Fetch discovery recommendation score 10 times consecutively
        int firstScore = -1;
        for (int i = 0; i < 10; i++) {
            String res = mockMvc.perform(get("/api/discovery/opportunities/" + oppId)
                            .header("Authorization", "Bearer " + studentToken))
                    .andExpect(status().isOk())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            int score = objectMapper.readTree(res).get("matchScore").asInt();
            String category = objectMapper.readTree(res).get("matchCategory").asText();
            String why = objectMapper.readTree(res).get("whyRecommended").asText();

            assertNotNull(category);
            assertNotNull(why);

            if (i == 0) {
                firstScore = score;
                assertTrue(score > 0, "Score should be positive");
            } else {
                assertEquals(firstScore, score, "Score must remain 100% deterministic across all runs");
            }
        }
    }

    @Test
    @DisplayName("Dynamic Unknown Technology Discovery: Candidate Detection, Lifecycle, and Promotion")
    void testDynamicTechnologyDiscoveryLifecycle() throws Exception {
        String recruiterToken = registerAndGetToken("recruiter_tech@kasumio.com", Role.RECRUITER, "Recruiter Tech", null);

        // 1. Detect unknown candidate
        mockMvc.perform(post("/api/discovery/candidates/discover?term=Bun.js&source=OPPORTUNITY_SUBMISSION")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rawName", is("Bun.js")))
                .andExpect(jsonPath("$.status", is("DISCOVERED")));

        // 2. List candidates
        String candidatesRes = mockMvc.perform(get("/api/discovery/candidates?status=DISCOVERED")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long candidateId = objectMapper.readTree(candidatesRes).get(0).get("id").asLong();

        // 3. Promote candidate to verified taxonomy
        mockMvc.perform(post("/api/discovery/candidates/" + candidateId + "/verify")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk());

        // 4. Verify it can now be resolved in the taxonomy
        assertTrue(normalizationService.resolve("Bun.js").isPresent());
    }

    @Test
    @DisplayName("Career Intelligence: Graph 1 Capability Map, Graph 8 What-If Simulator, Readiness Breakdown")
    void testCareerIntelligenceAndWhatIf() throws Exception {
        String recruiterToken = registerAndGetToken("recruiter_ci@kasumio.com", Role.RECRUITER, "Recruiter CI", null);
        String studentToken = registerAndGetToken("student_ci@kasumio.com", Role.STUDENT, "Student CI", null);

        Skill java = skillRepository.findByNameIgnoreCase("Java").orElseThrow();
        Skill docker = skillRepository.findByNameIgnoreCase("Docker").orElseThrow();
        Skill aws = normalizationService.resolve("AWS").orElseThrow();

        // Student has Java
        addEvidence(studentToken, java.getId(), "Java Core Service", "https://github.com/test/core-service");

        // Opportunity requires Java and Docker
        Long oppId = createAndPublishOpportunity(recruiterToken, "Cloud Software Engineer", OpportunityType.JOB, WorkType.REMOTE,
                List.of(
                        new SkillRequirementDto(java.getId(), java.getName(), java.getCategory(), SkillRequirementType.REQUIRED),
                        new SkillRequirementDto(docker.getId(), docker.getName(), docker.getCategory(), SkillRequirementType.REQUIRED),
                        new SkillRequirementDto(aws.getId(), aws.getName(), aws.getCategory(), SkillRequirementType.PREFERRED)
                ),
                "Building resilient cloud systems with Java, Docker, and AWS."
        );

        // 1. Graph 1: Technology Graph (Career Capability Map)
        mockMvc.perform(get("/api/discovery/technology-graph")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nodes", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.edges", notNullValue()));

        // 2. Graph 2: Opportunity Readiness & Distance Breakdown
        mockMvc.perform(get("/api/discovery/opportunities/" + oppId + "/readiness")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matchScore", greaterThan(0)))
                .andExpect(jsonPath("$.readinessScore", greaterThan(0)))
                .andExpect(jsonPath("$.opportunityDistance", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.opportunityDistanceExplanation", notNullValue()));

        // 3. Career Intelligence Hub: Demand, Clusters, Leverage, ROI
        mockMvc.perform(get("/api/discovery/career-intelligence")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalOpportunitiesAnalyzed", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.topDemandedTechnologies", notNullValue()))
                .andExpect(jsonPath("$.opportunityClusters", notNullValue()))
                .andExpect(jsonPath("$.highestLeverageSkills", notNullValue()))
                .andExpect(jsonPath("$.recommendedRoiProjects", notNullValue()));

        // 4. Graph 8: Career What-If Simulator (Simulating Docker)
        CareerWhatIfRequest whatIfReq = new CareerWhatIfRequest(docker.getId(), "Docker", null);
        mockMvc.perform(post("/api/discovery/career-what-if")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(whatIfReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.simulatedSkillName", is("Docker")))
                .andExpect(jsonPath("$.scenarioDisclaimer", containsString("MODELED SCENARIO")))
                .andExpect(jsonPath("$.modeledAverageMatchScore", greaterThanOrEqualTo(0.0)));
    }
}
