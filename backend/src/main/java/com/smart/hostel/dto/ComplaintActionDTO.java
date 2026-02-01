package com.smart.hostel.dto;

import java.time.LocalDateTime;

public record ComplaintActionDTO(Long actionId, Long complaintId, Long staffId, String actionTaken,
		LocalDateTime actionTime) {
}
