package com.fixonaut.backend.technician;

import com.fixonaut.backend.common.exception.ConflictException;
import com.fixonaut.backend.common.exception.ResourceNotFoundException;
import com.fixonaut.backend.organization.OrganizationEntity;
import com.fixonaut.backend.organization.OrganizationRepository;
import com.fixonaut.backend.security.AuthenticatedUserContext;
import com.fixonaut.backend.user.UserEntity;
import com.fixonaut.backend.user.UserRepository;
import com.fixonaut.backend.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TechnicianService {

    private final TechnicianProfileRepository
            technicianProfileRepository;

    private final OrganizationRepository organizationRepository;

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticatedUserContext
            authenticatedUserContext;

    @Transactional
    public TechnicianResponse create(
            CreateTechnicianRequest request
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        OrganizationEntity organization =
                findOrganization(organizationId);

        String normalizedEmail =
                normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(
                normalizedEmail
        )) {
            throw new ConflictException(
                    "EMAIL_ALREADY_REGISTERED",
                    "An account with this email already exists"
            );
        }

        UserEntity technicianUser = new UserEntity(
                organization,
                normalizeRequired(request.name()),
                normalizedEmail,
                passwordEncoder.encode(request.password()),
                UserRole.TECHNICIAN
        );

        UserEntity savedUser =
                userRepository.save(technicianUser);

        TechnicianProfileEntity profile =
                new TechnicianProfileEntity(
                        organization,
                        savedUser,
                        normalizeRequired(request.phone()),
                        normalizeNullable(request.skills()),
                        normalizeNullable(request.serviceArea())
                );

        TechnicianProfileEntity savedProfile =
                technicianProfileRepository.save(profile);

        return toResponse(savedProfile);
    }

    @Transactional(readOnly = true)
    public Page<TechnicianResponse> search(
            String search,
            Pageable pageable
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        return technicianProfileRepository
                .searchActiveTechnicians(
                        organizationId,
                        normalizeNullable(search),
                        pageable
                )
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TechnicianResponse getById(
            UUID technicianId
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        TechnicianProfileEntity profile =
                findProfile(
                        technicianId,
                        organizationId
                );

        return toResponse(profile);
    }

    @Transactional
    public TechnicianResponse update(
            UUID technicianId,
            UpdateTechnicianRequest request
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        TechnicianProfileEntity profile =
                findProfile(
                        technicianId,
                        organizationId
                );

        profile.getUser().changeName(
                normalizeRequired(request.name())
        );

        profile.updateDetails(
                normalizeRequired(request.phone()),
                normalizeNullable(request.skills()),
                normalizeNullable(request.serviceArea())
        );

        return toResponse(profile);
    }

    @Transactional
    public TechnicianResponse deactivate(
            UUID technicianId
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        TechnicianProfileEntity profile =
                findProfile(
                        technicianId,
                        organizationId
                );

        profile.deactivate();
        profile.getUser().deactivate();

        return toResponse(profile);
    }

    private OrganizationEntity findOrganization(
            UUID organizationId
    ) {
        return organizationRepository
                .findById(organizationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Organization not found"
                        )
                );
    }

    private TechnicianProfileEntity findProfile(
            UUID technicianId,
            UUID organizationId
    ) {
        return technicianProfileRepository
                .findByIdAndOrganizationId(
                        technicianId,
                        organizationId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Technician not found"
                        )
                );
    }

    private TechnicianResponse toResponse(
            TechnicianProfileEntity profile
    ) {
        UserEntity user = profile.getUser();

        return new TechnicianResponse(
                profile.getId(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                profile.getPhone(),
                profile.getSkills(),
                profile.getServiceArea(),
                profile.isActive(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeRequired(String value) {
        return value.trim();
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        return normalized.isBlank() ? null : normalized;
    }
}