package com.example.app.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrlPattern;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

import com.example.app.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AuthFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void protectedPageRedirectsToLoginWhenAnonymous() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrlPattern("**/auth/login"));
    }

    @Test
    void userCanRegisterAndPasswordIsHashed() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .param("name", "Test User")
                        .param("email", "register@example.com")
                        .param("password", "password123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/auth/login"));

        var user = userRepository.findByEmail("register@example.com").orElseThrow();
        assertThat(user.getPassword()).isNotEqualTo("password123");
        assertThat(passwordEncoder.matches("password123", user.getPassword())).isTrue();
    }

    @Test
    void duplicateEmailCannotRegister() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .param("name", "First User")
                        .param("email", "duplicate@example.com")
                        .param("password", "password123"))
                .andExpect(status().is3xxRedirection());

        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .param("name", "Second User")
                        .param("email", "duplicate@example.com")
                        .param("password", "password123"))
                .andExpect(status().isOk())
                .andExpect(view().name("auth/register"));
    }

    @Test
    void validCredentialsCanLogin() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .param("name", "Login User")
                        .param("email", "login@example.com")
                        .param("password", "password123"))
                .andExpect(status().is3xxRedirection());

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .param("email", "login@example.com")
                        .param("password", "password123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/"));
    }

    @Test
    void invalidCredentialsCannotLogin() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .param("email", "missing@example.com")
                        .param("password", "wrong-password"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/auth/login?error"));
    }
}
