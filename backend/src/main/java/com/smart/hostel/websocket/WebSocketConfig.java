package com.smart.hostel.websocket;

import java.util.List;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.smart.hostel.security.CustomUserDetailsService;
import com.smart.hostel.security.JwtUtil;

import lombok.AllArgsConstructor;

@Configuration
@EnableWebSocketMessageBroker
@AllArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

	private final JwtUtil jwtUtil;
	private final CustomUserDetailsService userDetailsService;

	@Override
	public void configureMessageBroker(MessageBrokerRegistry registry) {
		registry.enableSimpleBroker("/topic", "/queue");
		registry.setApplicationDestinationPrefixes("/app");
		registry.setUserDestinationPrefix("/user");
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		registry.addEndpoint("/ws").setAllowedOriginPatterns("*");
	}

	@Override
	public void configureClientInboundChannel(ChannelRegistration registration) {
		registration.interceptors(new ChannelInterceptor() {
			@Override
			public Message<?> preSend(Message<?> message, MessageChannel channel) {
				StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

				if (StompCommand.CONNECT.equals(accessor.getCommand())) {
					String jwtToken = null;

					List<String> authorization = accessor.getNativeHeader("Authorization");
					if (authorization != null && !authorization.isEmpty()) {
						String authHeader = authorization.get(0);
						if (authHeader.startsWith("Bearer ")) {
							jwtToken = authHeader.substring(7);
						}
					}

					if (jwtToken != null) {
						try {
							String username = jwtUtil.getUsernameFromToken(jwtToken);
							UserDetails userDetails = userDetailsService.loadUserByUsername(username);

							if (jwtUtil.validateToken(jwtToken, userDetails)) {
								UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
										userDetails, null, userDetails.getAuthorities());
								accessor.setUser(auth);
							}
						} catch (Exception e) {

						}
					}
				}
				return message;
			}
		});
	}
}
