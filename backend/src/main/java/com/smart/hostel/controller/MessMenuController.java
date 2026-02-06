package com.smart.hostel.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.smart.hostel.dto.MessMenuDTO;
import com.smart.hostel.service.MessMenuService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/mess/menu")
@AllArgsConstructor
public class MessMenuController extends BaseApiController {

	private final MessMenuService messMenuService;

	@PostMapping
	@PreAuthorize("hasRole('ADMIN') or @securityService.isMessWarden(principal.username)")
	public ResponseEntity<MessMenuDTO> add(@RequestBody MessMenuDTO dto) {
		return ResponseEntity.ok(messMenuService.addMenu(dto));
	}

	@GetMapping("/{date}")
	public ResponseEntity<List<MessMenuDTO>> getByDate(@PathVariable String date) {
		return ResponseEntity.ok(messMenuService.getMenuByDate(LocalDate.parse(date)));
	}

	@GetMapping("/today")
	public ResponseEntity<List<MessMenuDTO>> getToday() {
		return ResponseEntity.ok(messMenuService.getMenuByDate(LocalDate.now()));
	}
}
