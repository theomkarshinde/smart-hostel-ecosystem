package com.smart.hostel.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.StaffAttendanceDTO;
import com.smart.hostel.dto.StaffDTO;
import com.smart.hostel.dto.StaffDashboardStatsDTO;
import com.smart.hostel.entity.StaffType;
import com.smart.hostel.service.StaffService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/staff")
@AllArgsConstructor
public class StaffController extends BaseApiController {

	private final StaffService staffService;

	@PostMapping
	public ResponseEntity<StaffDTO> add(@RequestBody StaffDTO dto) {
		return ResponseEntity.ok(staffService.addStaff(dto));
	}

	@GetMapping("/type/{type}")
	public ResponseEntity<List<StaffDTO>> getByType(@PathVariable StaffType type) {
		return ResponseEntity.ok(staffService.getByType(type));
	}

	@GetMapping("/stats")
	public ResponseEntity<StaffDashboardStatsDTO> getStats() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String username = auth.getName();
		return ResponseEntity.ok(staffService.getDashboardStats(username));
	}

	@GetMapping("/attendance")
	public ResponseEntity<List<StaffAttendanceDTO>> getAttendance() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String username = auth.getName();
		return ResponseEntity.ok(staffService.getAttendanceHistory(username));
	}

	@GetMapping("/profile")
	public ResponseEntity<StaffDTO> getProfile() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String username = auth.getName();
		return ResponseEntity.ok(staffService.getProfile(username));
	}
}
