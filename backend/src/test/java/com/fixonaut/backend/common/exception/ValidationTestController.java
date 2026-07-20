package com.fixonaut.backend.common.exception;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dev")
public class ValidationTestController {

    @PostMapping("/test-validation")
    public Map<String, String> testValidation(
            @Valid @RequestBody ValidationRequest request
    ) {
        return Map.of(
                "message", "Validation passed",
                "name", request.name()
        );
    }

    public record ValidationRequest(
            @NotBlank(message = "Name is required")
            String name
    ) {
    }
}