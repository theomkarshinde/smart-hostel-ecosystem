package com.smart.hostel.dto;

public record WardenDashboardStatsDTO(long totalStudents, long pendingApprovals, long roomsAvailable,
		long todaysAttendance) {
}
