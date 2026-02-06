package com.smart.hostel.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.NotificationDTO;
import com.smart.hostel.dto.SendNotificationRequest;
import com.smart.hostel.service.NotificationService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/notifications")
@AllArgsConstructor
public class NotificationController extends BaseApiController {

	private final NotificationService notificationService;

	@PostMapping
	public ResponseEntity<NotificationDTO> send(@RequestBody NotificationDTO dto) {
		return ResponseEntity.ok(notificationService.send(dto));
	}

	@GetMapping("/unread/{userId}")
	public ResponseEntity<List<NotificationDTO>> getUnread(@PathVariable Long userId) {
		return ResponseEntity.ok(notificationService.getUnreadByUser(userId));
	}

	@PostMapping("/broadcast")
	public ResponseEntity<Void> broadcast(@RequestBody SendNotificationRequest request) {
		notificationService.broadcast(request);
		return ResponseEntity.ok().build();
	}
}
