package com.smart.hostel.dto;

import java.time.LocalDateTime;

public record UserDTO(Long userId, Integer roleId, String roleName, String username, String email, String phoneNumber,
		String fullName, String password, Boolean isActive, LocalDateTime createdAt) {
}
