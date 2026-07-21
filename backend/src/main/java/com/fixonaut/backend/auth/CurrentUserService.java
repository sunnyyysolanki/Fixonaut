package com.fixonaut.backend.auth;

import com.fixonaut.backend.common.exception.ResourceNotFoundException;
import com.fixonaut.backend.user.UserEntity;
import com.fixonaut.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AuthenticatedUserResponse getCurrentUser(String subject) {
        UUID userId;

        try {
            userId = UUID.fromString(subject);
        } catch (IllegalArgumentException exception) {
            throw new ResourceNotFoundException("Authenticated user not found");
        }

        UserEntity user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Authenticated user not found"
                        )
                );

        return new AuthenticatedUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getOrganization().getId(),
                user.getRoles()
        );
    }
}