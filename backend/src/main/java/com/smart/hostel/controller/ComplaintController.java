package com.smart.hostel.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.ComplaintActionDTO;
import com.smart.hostel.dto.ComplaintDTO;
import com.smart.hostel.entity.ComplaintStatus;
import com.smart.hostel.service.ComplaintActionService;
import com.smart.hostel.service.ComplaintService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/complaints")
@AllArgsConstructor
public class ComplaintController extends BaseApiController {

	private final ComplaintService complaintService;
	private final ComplaintActionService complaintActionService;

	@PostMapping("/action")
	public ResponseEntity<ComplaintActionDTO> addAction(@RequestBody ComplaintActionDTO dto) {
		return ResponseEntity.ok(complaintActionService.takeAction(dto));
	}

	@PostMapping
	public ResponseEntity<ComplaintDTO> raise(@RequestBody ComplaintDTO dto, java.security.Principal principal) {
		return ResponseEntity.ok(complaintService.raise(dto, principal.getName())); // Pass username
	}

	@GetMapping("/student/{studentId}")
	public ResponseEntity<List<ComplaintDTO>> getByStudent(@PathVariable Long studentId) {
		return ResponseEntity.ok(complaintService.getByStudent(studentId));
	}

	@GetMapping("/building/{buildingId}/status/{status}")
	public ResponseEntity<List<ComplaintDTO>> getByBuilding(@PathVariable Long buildingId,
			@PathVariable ComplaintStatus status) {
		return ResponseEntity.ok(complaintService.getByBuilding(buildingId, status));
	}

	@GetMapping("/building/{buildingId}/all")
	public ResponseEntity<List<ComplaintDTO>> getAllByBuilding(@PathVariable Long buildingId) {
		return ResponseEntity.ok(complaintService.getAllByBuilding(buildingId));
	}

	@GetMapping("/mess")
	public ResponseEntity<List<ComplaintDTO>> getMessComplaints() {
		return ResponseEntity.ok(complaintService.getMessComplaints());
	}

	@PutMapping("/{complaintId}/status/{status}")
	public ResponseEntity<ComplaintDTO> updateStatus(@PathVariable Long complaintId,
			@PathVariable ComplaintStatus status, @RequestParam(required = false) String comment) {
		return ResponseEntity.ok(complaintService.updateStatus(complaintId, status, comment));
	}
}
