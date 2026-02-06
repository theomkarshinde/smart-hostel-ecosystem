package com.smart.hostel.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.HostelBuildingDTO;
import com.smart.hostel.dto.RoomDTO;
import com.smart.hostel.service.HostelBuildingService;
import com.smart.hostel.service.RoomService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/buildings")
@AllArgsConstructor
public class HostelBuildingController extends BaseApiController {

	private final HostelBuildingService buildingService;
	private final RoomService roomService;

	@PostMapping
	public ResponseEntity<HostelBuildingDTO> create(@RequestBody HostelBuildingDTO dto) {
		return ResponseEntity.ok(buildingService.create(dto));
	}

	@GetMapping("/{id}")
	public ResponseEntity<HostelBuildingDTO> getById(@PathVariable Long id) {
		return ResponseEntity.ok(buildingService.getById(id));
	}

	@GetMapping
	public ResponseEntity<List<HostelBuildingDTO>> getAll() {
		return ResponseEntity.ok(buildingService.getAll());
	}

	@GetMapping("/my")
	public ResponseEntity<List<HostelBuildingDTO>> getMyBuildings(Principal principal) {
		return ResponseEntity.ok(buildingService.getWardenBuildings(principal.getName()));
	}

	@GetMapping("/{id}/rooms")
	public ResponseEntity<List<RoomDTO>> getRooms(@PathVariable Long id) {
		return ResponseEntity.ok(roomService.getRoomsByBuilding(id));
	}
}
