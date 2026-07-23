package com.fixonaut.backend.auth;

import com.fixonaut.backend.user.UserEntity;

public record TokenRefreshResult(
        UserEntity user,
        String rawRefreshToken
) {
}
