package com.smart.hostel.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.smart.hostel.entity.HostelAction;

public record StaffAttendanceDTO(Long staffAttendanceId, Long staffId, Long buildingId, HostelAction action,
		LocalDate attendanceDate, LocalTime attendanceTime, LocalDateTime createdAt) {
}
