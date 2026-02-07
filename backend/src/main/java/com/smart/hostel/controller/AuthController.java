package com.smart.hostel.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.AuthRequest;
import com.smart.hostel.dto.AuthResponse;
import com.smart.hostel.dto.RegistrationRequest;
import com.smart.hostel.dto.UserDTO;
import com.smart.hostel.service.AuthService;
import com.smart.hostel.service.UserService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@AllArgsConstructor
public class AuthController {

	private final AuthService authService;
	private final UserService userService;

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
		return ResponseEntity.ok(authService.login(request));
	}

	@PostMapping("/register")
	public ResponseEntity<UserDTO> register(@RequestBody RegistrationRequest request) {
		return ResponseEntity.ok(authService.register(request));
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
		String username = request.get("username");
		userService.generateResetToken(username);
		return ResponseEntity.ok("Reset token generated");
	}

	@PostMapping("/reset-password")
	public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
		String token = request.get("token");
		String newPassword = request.get("newPassword");
		userService.resetPassword(token, newPassword);
		return ResponseEntity.ok("Password reset successfully");
	}
}
