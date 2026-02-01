package com.smart.hostel.dto;

import java.util.List;

import com.smart.hostel.entity.StaffType;

public record StaffDTO(Long staffId, Long userId, String fullName, StaffType staffType,
		List<Long> buildingIds, Boolean managesMess, UserDTO user) {
}