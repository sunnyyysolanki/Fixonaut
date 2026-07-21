package com.fixonaut.backend.customer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository
        extends JpaRepository<CustomerEntity, UUID> {

    @Query("""
            SELECT c
            FROM CustomerEntity c
            WHERE c.organization.id = :organizationId
              AND c.active = true
              AND (
                    :search IS NULL
                    OR :search = ''
                    OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR c.phone LIKE CONCAT('%', :search, '%')
              )
            ORDER BY c.createdAt DESC
            """)
    Page<CustomerEntity> searchActiveCustomers(
            @Param("organizationId") UUID organizationId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
            SELECT c
            FROM CustomerEntity c
            WHERE c.id = :customerId
              AND c.organization.id = :organizationId
            """)
    Optional<CustomerEntity> findByIdAndOrganizationId(
            @Param("customerId") UUID customerId,
            @Param("organizationId") UUID organizationId
    );

    @Query("""
            SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END
            FROM CustomerEntity c
            WHERE c.id = :customerId
              AND c.organization.id = :organizationId
            """)
    boolean existsByIdAndOrganizationId(
            @Param("customerId") UUID customerId,
            @Param("organizationId") UUID organizationId
    );
}