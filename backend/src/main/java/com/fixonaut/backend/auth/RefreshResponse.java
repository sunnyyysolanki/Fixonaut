package com.fixonaut.backend.auth;

public record RefreshResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        AuthenticatedUserResponse user
) {
}
