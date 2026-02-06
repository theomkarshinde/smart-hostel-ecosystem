package com.smart.hostel.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.UserDTO;
import com.smart.hostel.service.UserService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
public class UserController extends BaseApiController {

	private final UserService userService;

	@PostMapping
	public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO dto) {
		return ResponseEntity.ok(userService.createUser(dto));
	}

	@GetMapping("/by-username/{username}")
	public ResponseEntity<UserDTO> getByUsername(@PathVariable String username) {
		return ResponseEntity.ok(userService.getByUsername(username));
	}
}
