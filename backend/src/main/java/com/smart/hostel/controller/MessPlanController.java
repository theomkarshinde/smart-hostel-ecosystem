package com.smart.hostel.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.MessPlanDTO;
import com.smart.hostel.service.MessPlanService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/v1/api/mess/plans")
@AllArgsConstructor
public class MessPlanController {

	private final MessPlanService messPlanService;

	@PostMapping
	@org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or @securityService.isMessWarden(principal.username)")
	public ResponseEntity<MessPlanDTO> create(@RequestBody MessPlanDTO dto) {
		return ResponseEntity.ok(messPlanService.create(dto));
	}

	@GetMapping
	public ResponseEntity<List<MessPlanDTO>> getAll() {
		return ResponseEntity.ok(messPlanService.getAll());
	}
}
