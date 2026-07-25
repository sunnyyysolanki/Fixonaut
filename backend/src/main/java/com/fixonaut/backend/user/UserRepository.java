package com.fixonaut.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository
        extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Query("""
            SELECT DISTINCT user
            FROM UserEntity user
            JOIN user.roles role
            WHERE user.organization.id = :organizationId
              AND user.active = true
              AND role IN :roles
            """)
    List<UserEntity> findActiveByOrganizationAndRoles(
            @Param("organizationId") UUID organizationId,
            @Param("roles") Collection<UserRole> roles
    );
}