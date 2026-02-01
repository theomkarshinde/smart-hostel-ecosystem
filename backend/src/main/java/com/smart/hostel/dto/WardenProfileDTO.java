package com.smart.hostel.dto;

public record WardenProfileDTO(Long staffId, String fullName, Long buildingId, String buildingName, boolean managesMess,
		String email, String phoneNumber) {
}
