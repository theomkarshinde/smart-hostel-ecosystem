package com.smart.hostel.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.MessPlanDTO;
import com.smart.hostel.service.MessPlanService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/mess/plans")
@AllArgsConstructor
public class MessPlanController extends BaseApiController {

	private final MessPlanService messPlanService;

	@PostMapping
	@PreAuthorize("hasRole('ADMIN') or @securityService.isMessWarden(principal.username)")
	public ResponseEntity<MessPlanDTO> create(@RequestBody MessPlanDTO dto) {
		return ResponseEntity.ok(messPlanService.create(dto));
	}

	@GetMapping
	public ResponseEntity<List<MessPlanDTO>> getAll() {
		return ResponseEntity.ok(messPlanService.getAll());
	}

	@PutMapping("/{planId}")
	@PreAuthorize("hasRole('ADMIN') or @securityService.isMessWarden(principal.username)")
	public ResponseEntity<MessPlanDTO> update(@PathVariable Integer planId, @RequestBody MessPlanDTO dto) {
		return ResponseEntity.ok(messPlanService.update(planId, dto));
	}

	@DeleteMapping("/{planId}")
	@PreAuthorize("hasRole('ADMIN') or @securityService.isMessWarden(principal.username)")
	public ResponseEntity<Void> delete(@PathVariable Integer planId) {
		messPlanService.delete(planId);
		return ResponseEntity.ok().build();
	}
}
