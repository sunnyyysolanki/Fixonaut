package com.fixonaut.backend.service;

import jakarta.validation.constraints.Size;

public record ChangeStatusRequest(

        @Size(
                max = 1000,
                message = "Status note must not exceed 1000 characters"
        )
        String note
) {
}