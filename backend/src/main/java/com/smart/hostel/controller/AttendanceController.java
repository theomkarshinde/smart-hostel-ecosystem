package com.smart.hostel.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.StaffAttendanceDTO;
import com.smart.hostel.dto.StaffAttendanceStatusDTO;
import com.smart.hostel.dto.StudentAttendanceDTO;
import com.smart.hostel.entity.AttendanceType;
import com.smart.hostel.service.AttendanceService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/v1/attendance")
@AllArgsConstructor
public class AttendanceController {

	private final AttendanceService attendanceService;

	@PostMapping("/student")
	public ResponseEntity<StudentAttendanceDTO> markStudent(@RequestBody StudentAttendanceDTO dto,
			Principal principal) {
		return ResponseEntity.ok(attendanceService.markStudentAttendanceByUsername(principal.getName(), dto));
	}

	@PostMapping("/student/manual/{username}")
	public ResponseEntity<StudentAttendanceDTO> markStudentManual(@PathVariable String username,
			@RequestBody StudentAttendanceDTO dto) {
		return ResponseEntity.ok(attendanceService.markStudentAttendanceByUsername(username, dto));
	}

	@PostMapping("/staff")
	@PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
	public ResponseEntity<StaffAttendanceDTO> markStaff(@RequestBody StaffAttendanceDTO dto, Principal principal) {
		return ResponseEntity.ok(attendanceService.markStaffAttendance(dto, principal.getName()));
	}

	@PostMapping("/qr")
	public ResponseEntity<StudentAttendanceDTO> markByQr(@RequestParam String token,
			@RequestParam AttendanceType type) {
		return ResponseEntity.ok(attendanceService.markStudentAttendanceByQR(token, type));
	}

	@GetMapping("/student")
	public ResponseEntity<List<StudentAttendanceDTO>> getMyAttendance(Principal principal) {
		return ResponseEntity.ok(attendanceService.getStudentAttendance(principal.getName()));
	}

	@GetMapping("/markable-staff")
	public ResponseEntity<List<StaffAttendanceStatusDTO>> getMarkableStaff(Principal principal) {
		return ResponseEntity.ok(attendanceService.getMarkableStaff(principal.getName()));
	}
}
