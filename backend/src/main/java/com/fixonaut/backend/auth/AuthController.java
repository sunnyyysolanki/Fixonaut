package com.fixonaut.backend.auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import jakarta.servlet.http.HttpServletResponse;
import com.fixonaut.backend.common.exception.InvalidTokenException;
import com.fixonaut.backend.security.JwtService;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegistrationService registrationService;
    private final AuthenticationService authenticationService;
    private final CurrentUserService currentUserService;
    private final CookieHelper cookieHelper;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        RegisterResponse response =
                registrationService.register(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .path("/api/v1/organizations/{organizationId}")
                .buildAndExpand(response.organizationId())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        LoginResult result =
                authenticationService.login(request);

        cookieHelper.setRefreshTokenCookie(response, result.rawRefreshToken());

        return ResponseEntity.ok(result.loginResponse());
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(
            @CookieValue(name = "refresh_token", required = false)
            String refreshToken,
            HttpServletResponse response
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new InvalidTokenException("Refresh token is missing");
        }

        TokenRefreshResult result = refreshTokenService.refresh(refreshToken);

        String newAccessToken = jwtService.generateAccessToken(result.user());
        cookieHelper.setRefreshTokenCookie(response, result.rawRefreshToken());

        AuthenticatedUserResponse authenticatedUser =
                new AuthenticatedUserResponse(
                        result.user().getId(),
                        result.user().getName(),
                        result.user().getEmail(),
                        result.user().getOrganization().getId(),
                        result.user().getRoles()
                );

        RefreshResponse refreshResponse = new RefreshResponse(
                newAccessToken,
                "Bearer",
                jwtService.getExpirationSeconds(),
                authenticatedUser
        );

        return ResponseEntity.ok(refreshResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "refresh_token", required = false)
            String refreshToken,
            HttpServletResponse response
    ) {
        refreshTokenService.revoke(refreshToken);
        cookieHelper.clearRefreshTokenCookie(response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthenticatedUserResponse> getCurrentUser(
            @AuthenticationPrincipal Jwt jwt
    ) {
        AuthenticatedUserResponse response =
                currentUserService.getCurrentUser(jwt.getSubject());

        return ResponseEntity.ok(response);
    }
}