package com.smart.hostel.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.VisitorDTO;
import com.smart.hostel.entity.VisitorStatus;
import com.smart.hostel.service.VisitorService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/visitors")
@AllArgsConstructor
public class VisitorController extends BaseApiController {

	private final VisitorService visitorService;

	@PostMapping
	public ResponseEntity<VisitorDTO> log(@RequestBody VisitorDTO dto) {
		return ResponseEntity.ok(visitorService.log(dto));
	}

	@GetMapping("/student/{studentId}")
	public ResponseEntity<List<VisitorDTO>> getByStudent(@PathVariable Long studentId) {
		return ResponseEntity.ok(visitorService.getByStudent(studentId));
	}

	@GetMapping("/building/{buildingId}/pending")
	public ResponseEntity<List<VisitorDTO>> getPendingByBuilding(@PathVariable Long buildingId) {
		return ResponseEntity.ok(visitorService.getPendingRequestsByBuilding(buildingId));
	}

	@PostMapping("/request")
	public ResponseEntity<VisitorDTO> createRequest(@RequestBody VisitorDTO dto) {
		return ResponseEntity.ok(visitorService.createRequest(dto));
	}

	@PutMapping("/{visitorId}/status/{status}")
	public ResponseEntity<VisitorDTO> updateStatus(@PathVariable Long visitorId, @PathVariable String status) {
		return ResponseEntity.ok(visitorService.updateStatus(visitorId, VisitorStatus.valueOf(status)));
	}
}
