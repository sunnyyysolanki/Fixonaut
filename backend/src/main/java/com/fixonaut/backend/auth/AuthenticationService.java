package com.fixonaut.backend.auth;

import com.fixonaut.backend.common.exception.InvalidCredentialsException;
import com.fixonaut.backend.security.JwtService;
import com.fixonaut.backend.user.UserEntity;
import com.fixonaut.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public LoginResult login(LoginRequest request) {
        String normalizedEmail = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        UserEntity user = userRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.isActive()) {
            throw new InvalidCredentialsException();
        }

        boolean passwordMatches = passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
            );

        if (!passwordMatches) {
            throw new InvalidCredentialsException();
        }

        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = refreshTokenService.createRefreshToken(user);

        AuthenticatedUserResponse authenticatedUser =
                new AuthenticatedUserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getOrganization().getId(),
                        user.getRoles()
                );

        LoginResponse loginResponse = new LoginResponse(
                accessToken,
                "Bearer",
                jwtService.getExpirationSeconds(),
                authenticatedUser
        );

        return new LoginResult(loginResponse, rawRefreshToken);
    }
}