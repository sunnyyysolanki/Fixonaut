package com.fixonaut.backend.service;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceRequestStatusHistoryRepository
        extends JpaRepository<
        ServiceRequestStatusHistoryEntity,
        UUID
        > {

    List<ServiceRequestStatusHistoryEntity>
    findByServiceRequestIdOrderByChangedAtAsc(
            UUID serviceRequestId
    );
}