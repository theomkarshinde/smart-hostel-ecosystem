package com.smart.hostel.dto;

import java.time.LocalDateTime;

import com.smart.hostel.entity.ComplaintCategory;
import com.smart.hostel.entity.ComplaintStatus;

public record ComplaintDTO(Long complaintId, Long studentId, Long buildingId, ComplaintCategory category,
		String description, String resolutionComment, ComplaintStatus status, LocalDateTime createdAt,
		LocalDateTime updatedAt, String studentName, String roomNumber) {
}