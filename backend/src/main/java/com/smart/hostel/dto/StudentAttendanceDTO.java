package com.smart.hostel.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.smart.hostel.entity.AttendanceType;
import com.smart.hostel.entity.HostelAction;
import com.smart.hostel.entity.MealType;

public record StudentAttendanceDTO(Long attendanceId, Long studentId, Long buildingId, AttendanceType attendanceType,
		HostelAction hostelAction, MealType mealType, LocalDate attendanceDate, LocalTime attendanceTime,
		LocalDate createdAt) {
}
