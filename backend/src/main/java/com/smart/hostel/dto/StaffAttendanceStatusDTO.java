package com.smart.hostel.dto;

public record StaffAttendanceStatusDTO(StaffDTO staff, boolean isMarkedIn, boolean isMarkedOut) {
}
