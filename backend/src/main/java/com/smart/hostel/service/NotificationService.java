package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.NotificationDTO;
import com.smart.hostel.dto.SendNotificationRequest;

public interface NotificationService {
	NotificationDTO send(NotificationDTO dto);

	List<NotificationDTO> getUnreadByUser(Long userId);

	void broadcast(SendNotificationRequest request);
}