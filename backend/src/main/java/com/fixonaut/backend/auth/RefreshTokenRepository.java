package com.fixonaut.backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, UUID> {

    Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);

    @Modifying
    @Query("""
           UPDATE RefreshTokenEntity token
           SET token.revokedAt = CURRENT_TIMESTAMP
           WHERE token.user.id = :userId
             AND token.revokedAt IS NULL
           """)
    int revokeAllForUser(@Param("userId") UUID userId);
}
