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
import com.smart.hostel.dto.StudentDTO;
import com.smart.hostel.entity.AttendanceType;
import com.smart.hostel.entity.Staff;
import com.smart.hostel.entity.User;
import com.smart.hostel.exception.StaffNotFoundException;
import com.smart.hostel.exception.UserNotFoundException;
import com.smart.hostel.repository.StaffRepository;
import com.smart.hostel.repository.UserRepository;
import com.smart.hostel.service.AttendanceService;
import com.smart.hostel.service.StudentService;
import com.smart.hostel.exception.UnauthorizedException;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/attendance")
@AllArgsConstructor
public class AttendanceController extends BaseApiController {

	private final AttendanceService attendanceService;
	private final StudentService studentService;
	private final StaffRepository staffRepository;
	private final UserRepository userRepository;

	@PostMapping("/student")
	public ResponseEntity<StudentAttendanceDTO> markStudent(@RequestBody StudentAttendanceDTO dto,
			Principal principal) {
		String username = principal.getName();
		StudentDTO student = studentService.getStudentByUsername(username);

		StudentAttendanceDTO updatedDto = new StudentAttendanceDTO(dto.attendanceId(), student.studentId(),
				dto.buildingId(), dto.attendanceType(), dto.hostelAction(), dto.mealType(), dto.attendanceDate(),
				dto.attendanceTime(), dto.createdAt());
		return ResponseEntity.ok(attendanceService.markStudentAttendance(updatedDto));
	}

	@PostMapping("/student/manual/{username}")
	public ResponseEntity<StudentAttendanceDTO> markStudentManual(@PathVariable String username,
			@RequestBody StudentAttendanceDTO dto) {
		return ResponseEntity.ok(attendanceService.markStudentAttendanceByUsername(username, dto));
	}

	@PostMapping("/staff")
	@PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
	public ResponseEntity<StaffAttendanceDTO> markStaff(@RequestBody StaffAttendanceDTO dto, Principal principal) {
		String currentUsername = principal.getName();
		User currentUser = userRepository.findByUsername(currentUsername)
				.orElseThrow(() -> new UserNotFoundException("Current user not found"));

		Staff targetStaff = staffRepository.findById(dto.staffId())
				.orElseThrow(() -> new StaffNotFoundException("Target staff not found"));

		String currentUserRole = currentUser.getRole().getRoleName();
		String targetStaffRole = targetStaff.getUser().getRole().getRoleName();

		if (currentUserRole.equals("ADMIN")) {
			if (!targetStaffRole.equals("WARDEN")) {
				throw new UnauthorizedException(
						"Admins can only mark attendance for Wardens");
			}
		} else if (currentUserRole.equals("WARDEN")) {
			if (targetStaffRole.equals("ADMIN")) {
				throw new UnauthorizedException("Wardens cannot mark attendance for Admins");
			}
		}

		return ResponseEntity.ok(attendanceService.markStaffAttendance(dto));
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
