package com.fixonaut.backend.auth;

import com.fixonaut.backend.common.exception.ConflictException;
import com.fixonaut.backend.organization.OrganizationEntity;
import com.fixonaut.backend.organization.OrganizationRepository;
import com.fixonaut.backend.user.UserEntity;
import com.fixonaut.backend.user.UserRepository;
import com.fixonaut.backend.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedSlug = normalizeSlug(request.organizationSlug());
        String normalizedName = request.name().trim();
        String normalizedOrganizationName =
                request.organizationName().trim();

        validateEmailIsAvailable(normalizedEmail);
        validateSlugIsAvailable(normalizedSlug);

        OrganizationEntity organization = new OrganizationEntity(
                normalizedOrganizationName,
                normalizedSlug
        );

        OrganizationEntity savedOrganization =
                organizationRepository.save(organization);

        String passwordHash = passwordEncoder.encode(request.password());

        UserEntity owner = new UserEntity(
                savedOrganization,
                normalizedName,
                normalizedEmail,
                passwordHash,
                UserRole.OWNER
        );

        UserEntity savedOwner = userRepository.save(owner);

        return new RegisterResponse(
                savedOwner.getId(),
                savedOrganization.getId(),
                savedOrganization.getName(),
                savedOwner.getName(),
                savedOwner.getEmail(),
                UserRole.OWNER
        );
    }

    private void validateEmailIsAvailable(String email) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException(
                    "EMAIL_ALREADY_REGISTERED",
                    "An account with this email already exists"
            );
        }
    }

    private void validateSlugIsAvailable(String slug) {
        if (organizationRepository.existsBySlug(slug)) {
            throw new ConflictException(
                    "ORGANIZATION_SLUG_ALREADY_EXISTS",
                    "This organization slug is already in use"
            );
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeSlug(String slug) {
        return slug.trim().toLowerCase(Locale.ROOT);
    }
}