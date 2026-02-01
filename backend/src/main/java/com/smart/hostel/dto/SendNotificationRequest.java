package com.smart.hostel.dto;

import java.util.List;

public record SendNotificationRequest(String title, String message, List<Long> userIds, Boolean sendToAll,
		String targetRole) {
}
