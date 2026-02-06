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

import com.smart.hostel.dto.LaundryBookingDTO;
import com.smart.hostel.service.LaundryService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/laundry")
@AllArgsConstructor
public class LaundryController extends BaseApiController {

	private final LaundryService laundryService;

	@PostMapping("/book")
	public ResponseEntity<LaundryBookingDTO> book(@RequestBody LaundryBookingDTO dto) {
		return ResponseEntity.ok(laundryService.book(dto));
	}

	@GetMapping
	public ResponseEntity<List<LaundryBookingDTO>> getHistory(java.security.Principal principal) {
		return ResponseEntity.ok(laundryService.getHistory(principal.getName()));
	}

	@PutMapping("/{bookingId}/status/{status}")
	public ResponseEntity<LaundryBookingDTO> updateStatus(@PathVariable Long bookingId, @PathVariable String status) {
		return ResponseEntity.ok(laundryService.updateStatus(bookingId, status));
	}

	@GetMapping("/all")
	public ResponseEntity<List<LaundryBookingDTO>> getAll(java.security.Principal principal) {
		return ResponseEntity.ok(laundryService.getAllBookings(principal.getName()));
	}
}
