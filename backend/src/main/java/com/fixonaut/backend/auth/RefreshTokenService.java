package com.fixonaut.backend.auth;

import com.fixonaut.backend.common.exception.InvalidTokenException;
import com.fixonaut.backend.common.exception.ResourceNotFoundException;
import com.fixonaut.backend.user.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public String createRefreshToken(UserEntity user) {
        // Generate Secure Opaque Token
        byte[] bytes = new byte[64];
        secureRandom.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        // Hash Token
        String tokenHash = hashToken(rawToken);

        // Calculate Expiry: 7 days
        Instant expiresAt = Instant.now().plusSeconds(604800);

        RefreshTokenEntity refreshToken = new RefreshTokenEntity(user, tokenHash, expiresAt);
        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }

    @Transactional
    public TokenRefreshResult refresh(String rawToken) {
        String tokenHash = hashToken(rawToken);

        RefreshTokenEntity token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Invalid or missing refresh token"));

        if (!token.isUsable()) {
            // Revoke all for user if a revoked token is reused (indicates token theft/compromise)
            if (token.isRevoked()) {
                refreshTokenRepository.revokeAllForUser(token.getUser().getId());
            }
            throw new InvalidTokenException("Refresh token is expired or revoked");
        }

        UserEntity user = token.getUser();
        if (!user.isActive()) {
            throw new InvalidTokenException("User account is inactive");
        }

        // Generate rotated refresh token
        String newRawToken = createRefreshToken(user);
        String newTokenHash = hashToken(newRawToken);

        RefreshTokenEntity replacement = refreshTokenRepository.findByTokenHash(newTokenHash)
                .orElseThrow(() -> new ResourceNotFoundException("Failed to generate rotated token"));

        // Replace old token and mark used
        token.markUsed();
        token.replaceWith(replacement);
        refreshTokenRepository.save(token);

        return new TokenRefreshResult(user, newRawToken);
    }

    @Transactional
    public void revoke(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        String tokenHash = hashToken(rawToken);
        refreshTokenRepository.findByTokenHash(tokenHash)
                .ifPresent(token -> {
                    token.revoke();
                    refreshTokenRepository.save(token);
                });
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
