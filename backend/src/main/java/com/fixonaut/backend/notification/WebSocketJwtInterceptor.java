package com.fixonaut.backend.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class WebSocketJwtInterceptor
        implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {
        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(
                accessor.getCommand()
        )) {
            String authorization =
                    accessor.getFirstNativeHeader(
                            "Authorization"
                    );

            if (authorization == null
                    || !authorization.startsWith("Bearer ")) {
                throw new IllegalArgumentException(
                        "WebSocket Authorization header is required"
                );
            }

            String token =
                    authorization.substring("Bearer ".length());

            Jwt jwt = jwtDecoder.decode(token);

            List<SimpleGrantedAuthority> authorities =
                    new ArrayList<>();

            List<String> roles =
                    jwt.getClaimAsStringList("roles");

            if (roles != null) {
                roles.forEach(role ->
                        authorities.add(
                                new SimpleGrantedAuthority(
                                        "ROLE_" + role
                                )
                        )
                );
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            jwt.getSubject(),
                            null,
                            authorities
                    );

            accessor.setUser(authentication);
        }

        return message;
    }
}