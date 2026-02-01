package com.smart.hostel.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student_attendance", uniqueConstraints = {
		@UniqueConstraint(columnNames = { "student_id", "attendance_date", "meal_type" }) })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentAttendance {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "attendance_id")
	private Long attendanceId;

	@ManyToOne
	@JoinColumn(name = "student_id", nullable = false)
	private Student student;

	@ManyToOne
	@JoinColumn(name = "building_id")
	private HostelBuilding building;

	@Column(name = "attendance_date", nullable = false)
	private LocalDate attendanceDate;

	@Column(name = "attendance_time", nullable = false)
	private LocalTime attendanceTime;

	@Enumerated(EnumType.STRING)
	@Column(name = "attendance_type", nullable = false)
	private AttendanceType attendanceType;

	@Enumerated(EnumType.STRING)
	@Column(name = "hostel_action")
	private HostelAction hostelAction;

	@Enumerated(EnumType.STRING)
	@Column(name = "meal_type")
	private MealType mealType;

	@Column(name = "created_at")
	private LocalDateTime createdAt;
}
