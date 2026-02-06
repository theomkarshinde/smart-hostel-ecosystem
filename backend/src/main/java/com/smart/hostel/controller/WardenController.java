package com.smart.hostel.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.RegistrationRequest;
import com.smart.hostel.dto.StudentDTO;
import com.smart.hostel.dto.UserDTO;
import com.smart.hostel.dto.WardenDashboardStatsDTO;
import com.smart.hostel.dto.WardenProfileDTO;
import com.smart.hostel.service.StudentService;
import com.smart.hostel.service.UserService;
import com.smart.hostel.service.WardenService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/warden")
@AllArgsConstructor
@Slf4j
public class WardenController extends BaseApiController {

	private final WardenService wardenService;
	private final StudentService studentService;
	private final UserService userService;

	@GetMapping("/stats")
	public ResponseEntity<WardenDashboardStatsDTO> getStats() {
		log.debug("WardenController.getStats() called");
		try {
			Authentication auth = SecurityContextHolder.getContext().getAuthentication();
			String username = auth.getName();
			WardenDashboardStatsDTO stats = wardenService.getDashboardStats(username);
			log.debug("WardenController.getStats() returning: {}", stats);
			return ResponseEntity.ok(stats);
		} catch (Exception e) {
			log.error("WardenController.getStats() failed: {}", e.getMessage());
			throw e;
		}
	}

	@GetMapping("/profile")
	public ResponseEntity<WardenProfileDTO> getProfile(Principal principal) {
		return ResponseEntity.ok(wardenService.getProfile(principal.getName()));
	}

	@GetMapping("/students")
	public ResponseEntity<List<StudentDTO>> getAllStudents(Principal principal) {
		WardenProfileDTO profile = wardenService.getProfile(principal.getName());
		if (profile.buildingId() == null) {
			return ResponseEntity.ok(List.of());
		}
		return ResponseEntity.ok(studentService.getStudentsByBuilding(profile.buildingId()));
	}

	@PutMapping("/students/{id}")
	public ResponseEntity<StudentDTO> updateStudent(@PathVariable Long id, @RequestBody StudentDTO dto) {
		return ResponseEntity.ok(studentService.updateStudentDetails(id, dto));
	}

	@PostMapping("/students/register")
	public ResponseEntity<StudentDTO> registerStudent(@RequestBody RegistrationRequest request, Principal principal) {
		WardenProfileDTO profile = wardenService.getProfile(principal.getName());
		Long bId = profile.buildingId();

		UserDTO userDTO = new UserDTO(null, null, null, request.username(), request.email(), request.phoneNumber(),
				request.fullName(), request.password(), true, null);
		UserDTO createdUser = userService.createUser(userDTO);

		return ResponseEntity.ok(studentService.createApprovedStudent(createdUser.userId(), request.fullName(),
				request.gender(), request.totalFee(), bId, request.roomNumber()));
	}
}
