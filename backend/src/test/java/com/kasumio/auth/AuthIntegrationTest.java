package com.kasumio.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.auth.dto.LoginRequest;
import com.kasumio.auth.dto.RegisterRequest;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("1. Successful student registration and login with JWT issuance")
    void testSuccessfulRegistrationAndLogin() throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                "alice@example.com",
                "secretPassword123",
                Role.STUDENT,
                "Alice Engineer",
                null
        );

        // Register
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("alice@example.com"))
                .andExpect(jsonPath("$.user.role").value("STUDENT"))
                .andExpect(jsonPath("$.user.fullName").value("Alice Engineer"));

        // Login
        LoginRequest loginReq = new LoginRequest("alice@example.com", "secretPassword123");
        String loginResponse = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("alice@example.com"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String token = objectMapper.readTree(loginResponse).get("token").asText();

        // Access /api/me
        mockMvc.perform(get("/api/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alice@example.com"))
                .andExpect(jsonPath("$.fullName").value("Alice Engineer"));
    }

    @Test
    @DisplayName("2. Invalid login fails with 401 Unauthorized")
    void testInvalidLoginCredentials() throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                "bob@example.com",
                "correctPassword123",
                Role.STUDENT,
                "Bob Developer",
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        // Incorrect password
        LoginRequest invalidLogin = new LoginRequest("bob@example.com", "wrongPassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        // Non-existent email
        LoginRequest unknownUser = new LoginRequest("nonexistent@example.com", "anyPassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unknownUser)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("3. Duplicate registration is rejected with 409 Conflict")
    void testDuplicateRegistrationFails() throws Exception {
        RegisterRequest req = new RegisterRequest(
                "duplicate@example.com",
                "password12345",
                Role.STUDENT,
                "Charlie",
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("4. Abuse case: Public registration with ADMIN role is rejected with 403 Forbidden")
    void testRegisterAsAdminIsForbidden() throws Exception {
        RegisterRequest adminReq = new RegisterRequest(
                "hacker_admin@example.com",
                "superSecretPass123",
                Role.ADMIN,
                "Malicious Admin",
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("5. Abuse case: Password length under 10 characters is rejected with 400 Bad Request")
    void testShortPasswordIsRejected() throws Exception {
        RegisterRequest shortPassReq = new RegisterRequest(
                "short@example.com",
                "pass123", // only 7 chars
                Role.STUDENT,
                "Short Pass User",
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shortPassReq)))
                .andExpect(status().isBadRequest());
    }
}
