package com.kasumio.evidence;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.auth.dto.RegisterRequest;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class EvidenceOwnershipTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SkillRepository skillRepository;

    private String registerAndGetToken(String email, String name) throws Exception {
        RegisterRequest req = new RegisterRequest(email, "password123", Role.STUDENT, name, null);
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
    @DisplayName("5. Student creates evidence and manages own records with isolation")
    void testEvidenceCreationAndStudentIsolation() throws Exception {
        String tokenA = registerAndGetToken("alice_ev@example.com", "Alice Ev");
        String tokenB = registerAndGetToken("bob_ev@example.com", "Bob Ev");

        Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElseThrow();

        EvidenceRequest evidenceReq = new EvidenceRequest(
                javaSkill.getId(),
                "E-Commerce Backend Micro-service",
                "Built an order processing system with Spring Boot and MySQL.",
                "https://github.com/alice/ecommerce-backend",
                EvidenceType.PROJECT
        );

        // Student A creates evidence
        String createdResponse = mockMvc.perform(post("/api/evidence")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(evidenceReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title").value("E-Commerce Backend Micro-service"))
                .andExpect(jsonPath("$.verified").value(false))
                .andReturn()
                .getResponse()
                .getContentAsString();

        long evidenceId = objectMapper.readTree(createdResponse).get("id").asLong();

        // Student A can list their evidence
        mockMvc.perform(get("/api/evidence")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("E-Commerce Backend Micro-service"))
                .andExpect(jsonPath("$[0].verified").value(false));

        // Student B lists their evidence -> 0 items
        mockMvc.perform(get("/api/evidence")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Student B attempts to modify Student A's evidence -> 404 or 403
        EvidenceRequest hackerUpdate = new EvidenceRequest(
                javaSkill.getId(),
                "Hacked Title",
                "Description",
                "https://github.com/bob/hacked",
                EvidenceType.PROJECT
        );
        mockMvc.perform(put("/api/evidence/" + evidenceId)
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hackerUpdate)))
                .andExpect(status().isNotFound());

        // Student B attempts to delete Student A's evidence -> 404 or 403
        mockMvc.perform(delete("/api/evidence/" + evidenceId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Student A can delete their own evidence
        mockMvc.perform(delete("/api/evidence/" + evidenceId)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isNoContent());
    }
}
