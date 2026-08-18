package com.kasumio.student;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.auth.dto.RegisterRequest;
import com.kasumio.student.dto.StudentProfileRequest;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class StudentProfileTest {

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
    @DisplayName("3. Student profile CRUD and dashboard truthfulness")
    void testStudentProfileAndDashboard() throws Exception {
        String token = registerAndGetToken("student1@example.com", "Student One");

        // Verify initial empty dashboard (0 evidence, 0 verified, 0 goals)
        mockMvc.perform(get("/api/students/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEvidenceCount").value(0))
                .andExpect(jsonPath("$.verifiedEvidenceCount").value(0))
                .andExpect(jsonPath("$.careerGoalsCount").value(0));

        // Update profile
        StudentProfileRequest updateReq = new StudentProfileRequest(
                "Student One Updated",
                "Passionate backend developer learning Spring Boot and distributed systems.",
                "National Institute of Technology",
                2026
        );

        mockMvc.perform(put("/api/students/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Student One Updated"))
                .andExpect(jsonPath("$.university").value("National Institute of Technology"))
                .andExpect(jsonPath("$.graduationYear").value(2026));

        // Read profile
        mockMvc.perform(get("/api/students/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Student One Updated"));
    }

    @Test
    @DisplayName("4. Student ownership protection: Student A cannot access Student B's profile")
    void testStudentOwnershipProtection() throws Exception {
        String tokenA = registerAndGetToken("studentA@example.com", "Student A");
        String tokenB = registerAndGetToken("studentB@example.com", "Student B");

        // Get Student A's ID
        String profileA = mockMvc.perform(get("/api/students/profile")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        long studentAId = objectMapper.readTree(profileA).get("id").asLong();

        // Student B attempts to access Student A's profile directly
        mockMvc.perform(get("/api/students/" + studentAId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isForbidden());
    }
}
