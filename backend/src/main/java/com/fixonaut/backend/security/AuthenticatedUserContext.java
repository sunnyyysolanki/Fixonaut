package com.fixonaut.backend.security;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AuthenticatedUserContext {

    public UUID getCurrentUserId() {
        Jwt jwt = getJwt();

        try {
            return UUID.fromString(jwt.getSubject());
        } catch (IllegalArgumentException exception) {
            throw new AuthenticationCredentialsNotFoundException(
                    "Authenticated user ID is invalid"
            );
        }
    }

    public UUID getCurrentOrganizationId() {
        Jwt jwt = getJwt();

        String organizationId = jwt.getClaimAsString("organizationId");

        if (organizationId == null || organizationId.isBlank()) {
            throw new AuthenticationCredentialsNotFoundException(
                    "Authenticated organization is missing"
            );
        }

        try {
            return UUID.fromString(organizationId);
        } catch (IllegalArgumentException exception) {
            throw new AuthenticationCredentialsNotFoundException(
                    "Authenticated organization ID is invalid"
            );
        }
    }

    public boolean hasRole(String role) {
        Jwt jwt = getJwt();

        Object rolesClaim = jwt.getClaims().get("roles");

        if (!(rolesClaim instanceof Iterable<?> roles)) {
            return false;
        }

        for (Object roleValue : roles) {
            if (("ROLE_" + role).equals("ROLE_" + roleValue)) {
                return true;
            }
        }

        return false;
    }

    private Jwt getJwt() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null) {
            throw new AuthenticationCredentialsNotFoundException(
                    "Authentication is required"
            );
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof Jwt jwt)) {
            throw new AuthenticationCredentialsNotFoundException(
                    "JWT authentication is required"
            );
        }

        return jwt;
    }
}