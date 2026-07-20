package com.fixonaut.backend.common.exception;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ValidationTestController.class)
@Import(GlobalExceptionHandler.class)
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnStandardValidationErrorResponse() throws Exception {
        String invalidRequest = """
                {
                  "name": ""
                }
                """;

        mockMvc.perform(
                        post("/api/v1/dev/test-validation")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(invalidRequest)
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message")
                        .value("Request validation failed"))
                .andExpect(jsonPath("$.fieldErrors.name")
                        .value("Name is required"));
    }

    @Test
    void shouldAcceptValidRequest() throws Exception {
        String validRequest = """
                {
                  "name": "Fixonaut"
                }
                """;

        mockMvc.perform(
                        post("/api/v1/dev/test-validation")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(validRequest)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Validation passed"))
                .andExpect(jsonPath("$.name")
                        .value("Fixonaut"));
    }
}