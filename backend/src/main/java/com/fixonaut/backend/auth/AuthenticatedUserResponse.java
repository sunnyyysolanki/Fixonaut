package com.fixonaut.backend.auth;

import com.fixonaut.backend.user.UserRole;

import java.util.Set;
import java.util.UUID;

public record AuthenticatedUserResponse(
        UUID id,
        String name,
        String email,
        UUID organizationId,
        Set<UserRole> roles
) {
}