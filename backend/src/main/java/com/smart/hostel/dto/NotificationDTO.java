package com.smart.hostel.dto;

import java.time.LocalDateTime;

public record NotificationDTO(Long notificationId, Long userId, String title, String message, Boolean isRead,
		LocalDateTime createdAt) {
}
