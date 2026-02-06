package com.smart.hostel.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.StudentMessDTO;
import com.smart.hostel.service.StudentMessService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/mess/subscription")
@AllArgsConstructor
public class StudentMessController extends BaseApiController {

	private final StudentMessService studentMessService;

	@PostMapping
	@org.springframework.security.access.prepost.PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or @securityService.isMessWarden(principal.username)")
	public ResponseEntity<StudentMessDTO> subscribe(@RequestBody StudentMessDTO dto) {
		return ResponseEntity.ok(studentMessService.subscribe(dto));
	}

	@GetMapping
	public ResponseEntity<StudentMessDTO> getMySubscription(java.security.Principal principal) {
		return ResponseEntity.ok(studentMessService.getSubscription(principal.getName()));
	}
}
