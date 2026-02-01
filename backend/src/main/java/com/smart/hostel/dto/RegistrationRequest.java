package com.smart.hostel.dto;

import java.util.List;

import com.smart.hostel.entity.Gender;

public record RegistrationRequest(String username, String email, String password, String fullName, Gender gender,
		String staffType, Double totalFee, List<Long> buildingIds, String roomNumber, String phoneNumber,
		Boolean managesMess) {
}
