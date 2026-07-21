package com.fixonaut.backend.auth;

import com.fixonaut.backend.user.UserRole;

import java.util.UUID;

public record RegisterResponse(
        UUID userId,
        UUID organizationId,
        String organizationName,
        String userName,
        String email,
        UserRole role
) {
}