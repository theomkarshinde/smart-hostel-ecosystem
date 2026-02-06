package com.smart.hostel.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.GuardDashboardStatsDTO;
import com.smart.hostel.dto.VisitorDTO;
import com.smart.hostel.service.GuardService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/guard")
@AllArgsConstructor
public class GuardController extends BaseApiController {

	private final GuardService guardService;

	@PostMapping("/visitor")
	public ResponseEntity<VisitorDTO> logVisitor(@RequestBody VisitorDTO dto) {
		return ResponseEntity.ok(guardService.verifyAndLogVisitor(dto));
	}

	@GetMapping("/visitors/recent")
	public ResponseEntity<List<VisitorDTO>> getRecent() {
		return ResponseEntity.ok(guardService.getRecentVisitors());
	}

	@GetMapping("/stats")
	public ResponseEntity<GuardDashboardStatsDTO> getStats() {
		return ResponseEntity.ok(guardService.getDashboardStats());
	}
}
