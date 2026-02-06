package com.smart.hostel.security;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;

	@Value("${app.frontend.url}")
	private String frontendUrl;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.disable()).cors(cors -> cors.configurationSource(corsConfigurationSource())).httpBasic(
				basic -> basic.disable()).formLogin(form -> form.disable()).authorizeHttpRequests(
						auth -> auth
								.requestMatchers("/api/v1/auth/**", "/ws/**", "/error", "/v3/api-docs/**",
										"/swagger-ui/**", "/swagger-ui.html")
								.permitAll().requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
								.requestMatchers("/api/v1/admin/wardens/unassigned").hasRole("ADMIN")
								.requestMatchers("/api/v1/admin/buildings/unassigned").hasRole("ADMIN")
								.requestMatchers("/api/v1/students/search").hasAnyRole("WARDEN", "ADMIN", "GUARD")
								.requestMatchers("/api/v1/students/status/**").hasAnyRole("WARDEN", "ADMIN")
								.requestMatchers("/api/v1/students/*/approve/**").hasAnyRole("WARDEN", "ADMIN")
								.requestMatchers("/api/v1/students/*/reject").hasAnyRole("WARDEN", "ADMIN")
								.requestMatchers("/api/v1/students/**").hasAnyRole("STUDENT", "WARDEN", "ADMIN")
								.requestMatchers("/api/v1/notifications/broadcast").hasAnyRole("WARDEN", "ADMIN")
								.requestMatchers("/api/v1/notifications/**").authenticated()
								.requestMatchers("/api/v1/warden/**").hasAnyRole("WARDEN", "ADMIN")
								.requestMatchers("/api/v1/complaints/**")
								.hasAnyRole("WARDEN", "ADMIN", "STUDENT", "STAFF").requestMatchers("/api/v1/mess/**")
								.hasAnyRole("WARDEN", "ADMIN", "STUDENT").requestMatchers("/api/v1/laundry/**")
								.hasAnyRole("WARDEN", "ADMIN", "STUDENT").requestMatchers("/api/v1/staff/**")
								.hasAnyRole("STAFF", "WARDEN", "ADMIN", "GUARD").requestMatchers("/api/v1/guard/**")
								.hasAnyRole("GUARD", "ADMIN")

								.requestMatchers("/api/v1/visitors/request").hasRole("STUDENT")
								.requestMatchers("/api/v1/visitors/building/**").hasAnyRole("WARDEN", "ADMIN")
								.requestMatchers("/api/v1/visitors/*/status/**").hasAnyRole("WARDEN", "ADMIN", "GUARD")
								.requestMatchers("/api/v1/visitors/student/**")
								.hasAnyRole("STUDENT", "WARDEN", "ADMIN", "GUARD")
								.requestMatchers("/api/v1/visitors/**").hasAnyRole("GUARD", "ADMIN", "WARDEN")

								.requestMatchers("/api/v1/payments/add-cash").hasAnyRole("WARDEN", "ADMIN")
								.requestMatchers("/api/v1/payments/**").authenticated()
								.requestMatchers("/api/v1/attendance/**")
								.hasAnyRole("WARDEN", "ADMIN", "GUARD", "STUDENT", "STAFF").anyRequest()
								.authenticated())
				.exceptionHandling(exc -> exc.authenticationEntryPoint((request, response, authException) -> {
					log.warn("Unauthorized access attempt: {}", authException.getMessage());
					response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
					response.setHeader("WWW-Authenticate", "");
					response.setContentType("application/json");
					response.getWriter().write(
							"{\"error\": \"Unauthorized\", \"message\": \"" + authException.getMessage() + "\"}");
				})).sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
		return authConfig.getAuthenticationManager();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(Arrays.asList(frontendUrl));
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
		configuration.setAllowedHeaders(Arrays.asList("*"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}
