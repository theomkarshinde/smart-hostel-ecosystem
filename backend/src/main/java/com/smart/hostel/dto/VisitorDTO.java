package com.smart.hostel.dto;

import java.time.LocalDateTime;

import com.smart.hostel.entity.VisitorStatus;

public record VisitorDTO(Long visitorId, Long studentId, String studentName, String visitorName, String contactNumber,
		String purpose, VisitorStatus status, LocalDateTime visitDate, LocalDateTime inTime, LocalDateTime outTime) {
}
