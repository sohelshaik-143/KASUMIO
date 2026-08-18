package com.kasumio.goal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.auth.dto.RegisterRequest;
import com.kasumio.goal.dto.CareerGoalRequest;
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
public class CareerGoalTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
    @DisplayName("7. Student career goals CRUD and ownership protection")
    void testCareerGoalCrudAndOwnership() throws Exception {
        String tokenA = registerAndGetToken("goal_a@example.com", "Student A");
        String tokenB = registerAndGetToken("goal_b@example.com", "Student B");

        CareerGoalRequest createReq = new CareerGoalRequest(
                "Senior Java Backend Engineer",
                "Master Spring Boot, microservices architecture, and clean relational database design.",
                "Java Backend Engineer"
        );

        // Student A creates career goal
        String createdRes = mockMvc.perform(post("/api/career-goals")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title").value("Senior Java Backend Engineer"))
                .andExpect(jsonPath("$.targetRole").value("Java Backend Engineer"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        long goalId = objectMapper.readTree(createdRes).get("id").asLong();

        // Student A lists goals -> 1
        mockMvc.perform(get("/api/career-goals")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // Student B lists goals -> 0
        mockMvc.perform(get("/api/career-goals")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Student B cannot update Student A's goal
        CareerGoalRequest updateReq = new CareerGoalRequest("Modified Title", "Desc", "Role");
        mockMvc.perform(put("/api/career-goals/" + goalId)
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isNotFound());

        // Student B cannot delete Student A's goal
        mockMvc.perform(delete("/api/career-goals/" + goalId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Student A updates own goal
        mockMvc.perform(put("/api/career-goals/" + goalId)
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Modified Title"));

        // Student A deletes own goal
        mockMvc.perform(delete("/api/career-goals/" + goalId)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isNoContent());
    }
}
