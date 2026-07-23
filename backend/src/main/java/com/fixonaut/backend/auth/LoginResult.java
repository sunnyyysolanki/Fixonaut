package com.fixonaut.backend.auth;

public record LoginResult(
        LoginResponse loginResponse,
        String rawRefreshToken
) {
}
