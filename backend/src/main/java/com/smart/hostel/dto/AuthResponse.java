package com.smart.hostel.dto;

public record AuthResponse(String token, String username, String role, Long userId, Integer roleId,
		Boolean managesMess) {
}
