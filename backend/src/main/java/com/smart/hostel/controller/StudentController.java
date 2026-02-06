package com.smart.hostel.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.ApproveStudentRequest;
import com.smart.hostel.dto.StudentDTO;
import com.smart.hostel.dto.StudentStatsDTO;
import com.smart.hostel.entity.StudentStatus;
import com.smart.hostel.service.QRCodeService;
import com.smart.hostel.service.StudentService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/students")
@AllArgsConstructor
public class StudentController extends BaseApiController {

	private final StudentService studentService;
	private final QRCodeService qrCodeService;

	@PostMapping("/register")
	public ResponseEntity<StudentDTO> register(@RequestBody StudentDTO dto) {
		return ResponseEntity.ok(studentService.register(dto));
	}

	@PutMapping("/{studentId}/approve/{buildingId}")
	public ResponseEntity<StudentDTO> approve(@PathVariable Long studentId, @PathVariable Long buildingId,
			@RequestBody(required = false) ApproveStudentRequest request) {
		Double totalFee = (request != null && request.totalFee() != null) ? request.totalFee() : 0.0;
		Boolean isEmi = (request != null && request.isEmiEnabled() != null) ? request.isEmiEnabled() : false;
		Double emiAmount = (request != null && request.emiAmount() != null) ? request.emiAmount() : 0.0;
		String roomNumber = (request != null) ? request.roomNumber() : null;

		return ResponseEntity.ok(studentService.approve(studentId, buildingId, totalFee, isEmi, emiAmount, roomNumber));
	}

	@PutMapping("/{studentId}/reject")
	public ResponseEntity<StudentDTO> reject(@PathVariable Long studentId) {
		return ResponseEntity.ok(studentService.reject(studentId));
	}

	@GetMapping("/status/{status}")
	public ResponseEntity<List<StudentDTO>> getByStatus(@PathVariable StudentStatus status) {
		return ResponseEntity.ok(studentService.getByStatus(status));
	}

	@GetMapping("/stats")
	public ResponseEntity<StudentStatsDTO> getStats(Principal principal) {
		return ResponseEntity.ok(studentService.getStats(principal.getName()));
	}

	@GetMapping("/qr")
	public ResponseEntity<String> getQr(Principal principal) {
		return ResponseEntity.ok(qrCodeService.generateAttendanceQr(principal.getName()));
	}

	@GetMapping("/search")
	public ResponseEntity<List<StudentDTO>> search(@RequestParam String query) {
		return ResponseEntity.ok(studentService.searchStudents(query));
	}

	@PatchMapping("/{studentId}/payment-setup")
	public ResponseEntity<StudentDTO> setupPayment(@PathVariable Long studentId, @RequestParam Boolean isEmi,
			@RequestParam(required = false) Double emiAmount) {
		return ResponseEntity.ok(studentService.selectPaymentMethod(studentId, isEmi, emiAmount));
	}

	@GetMapping("/profile")
	public ResponseEntity<StudentDTO> getProfile(Principal principal) {
		return ResponseEntity.ok(studentService.getStudentByUsername(principal.getName()));
	}

	@GetMapping("/allocated-rooms/{buildingId}")
	public ResponseEntity<List<String>> getAllocatedRooms(@PathVariable Long buildingId) {
		return ResponseEntity.ok(studentService.getAllocatedRooms(buildingId));
	}
}
