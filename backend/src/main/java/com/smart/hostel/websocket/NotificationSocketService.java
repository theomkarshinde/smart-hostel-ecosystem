package com.smart.hostel.websocket;

import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.smart.hostel.dto.NotificationDTO;

@Service
public class NotificationSocketService {

	private final SimpMessagingTemplate messagingTemplate;

	public NotificationSocketService(@Lazy SimpMessagingTemplate messagingTemplate) {
		this.messagingTemplate = messagingTemplate;
	}

	public void sendToUser(String username, NotificationDTO dto) {
		messagingTemplate.convertAndSendToUser(username, "/queue/notifications", dto);
	}
}
