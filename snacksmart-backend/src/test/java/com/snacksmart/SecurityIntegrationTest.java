package com.snacksmart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.snacksmart.entity.User;
import com.snacksmart.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end proof that the auth/authorization fix actually works: real
 * signed tokens are issued, and role-gated endpoints reject the wrong role
 * instead of the previous permitAll()-for-everything behavior.
 *
 * Uses MockMvc (no real network socket) against an in-memory H2 database
 * (see application-test.properties) — runs the full Spring context,
 * including the real security filter chain, without needing a live server
 * port or a real MySQL instance.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper json = new ObjectMapper();

    @BeforeEach
    void seedUsers() {
        userRepository.deleteAll();
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@test.com");
        admin.setPassword(encoder.encode("password"));
        admin.setRole(User.Role.ADMIN);
        userRepository.save(admin);

        User customer = new User();
        customer.setUsername("jane");
        customer.setEmail("jane@test.com");
        customer.setPassword(encoder.encode("password"));
        customer.setRole(User.Role.CUSTOMER);
        userRepository.save(customer);
    }

    @Test
    void loginReturnsARealSignedJwt_notThePlaceholderString() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("username", "jane", "password", "password"))))
                .andExpect(status().isOk())
                .andReturn();

        String token = readToken(result);
        assertThat(token).isNotEqualTo("dummy-jwt-token");
        // a real JWT is three base64url segments separated by dots: header.payload.signature
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    void adminLoginRejectsANonAdminAccount_evenWithTheCorrectPassword() throws Exception {
        mockMvc.perform(post("/api/auth/admin-login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("username", "jane", "password", "password"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminEndpoint_rejectsRequestWithNoToken() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isIn(401, 403));
    }

    @Test
    void adminEndpoint_rejectsAValidTokenBelongingToANonAdminUser() throws Exception {
        String token = loginAndGetToken("jane", "password");

        mockMvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminEndpoint_acceptsAValidAdminToken() throws Exception {
        String token = loginAndGetToken("admin", "password");

        mockMvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    private String loginAndGetToken(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("username", username, "password", password))))
                .andReturn();
        return readToken(result);
    }

    @SuppressWarnings("unchecked")
    private String readToken(MvcResult result) throws Exception {
        Map<String, Object> body = json.readValue(result.getResponse().getContentAsString(), Map.class);
        return (String) body.get("token");
    }
}
