package com.smart.hostel.dto;

import java.time.LocalDateTime;

import com.smart.hostel.entity.BuildingType;

public record HostelBuildingDTO(Long buildingId, String buildingName, BuildingType buildingType, Integer totalRooms,
		Integer totalCapacity, Integer availableRooms, Double fee, LocalDateTime createdAt, String assignedWarden,
		Long assignedWardenId) {
}
