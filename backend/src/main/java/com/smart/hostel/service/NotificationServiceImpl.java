package com.smart.hostel.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.NotificationDTO;
import com.smart.hostel.dto.SendNotificationRequest;
import com.smart.hostel.entity.Notification;
import com.smart.hostel.entity.User;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.repository.NotificationRepository;
import com.smart.hostel.repository.UserRepository;
import com.smart.hostel.websocket.NotificationSocketService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class NotificationServiceImpl implements NotificationService {

	private final NotificationRepository notificationRepository;
	private final UserRepository userRepository;
	private final NotificationSocketService socketService;

	@Override
	public NotificationDTO send(NotificationDTO dto) {
		User user = userRepository.findById(dto.userId())
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		Notification n = new Notification();
		n.setUser(user);
		n.setTitle(dto.title());
		n.setMessage(dto.message());
		n.setIsRead(false);

		Notification saved = notificationRepository.save(n);

		NotificationDTO result = new NotificationDTO(saved.getNotificationId(), saved.getUser().getUserId(),
				saved.getTitle(), saved.getMessage(), saved.getIsRead(), saved.getCreatedAt());

		socketService.sendToUser(user.getUsername(), result);

		return result;
	}

	@Override
	public List<NotificationDTO> getUnreadByUser(Long userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
		List<NotificationDTO> list = new ArrayList<>();

		for (Notification n : notificationRepository.findByUserAndIsReadFalse(user)) {
			list.add(new NotificationDTO(n.getNotificationId(), n.getUser().getUserId(), n.getTitle(), n.getMessage(),
					n.getIsRead(), n.getCreatedAt()));
		}
		return list;
	}

	@Override
	public void broadcast(SendNotificationRequest request) {
		List<User> targets = new ArrayList<>();

		if (Boolean.TRUE.equals(request.sendToAll())) {
			String role = (request.targetRole() == null || request.targetRole().isEmpty()) ? "STUDENT"
					: request.targetRole();
			targets = userRepository.findByRole_RoleName(role);
		} else if (request.userIds() != null && !request.userIds().isEmpty()) {
			targets = userRepository.findAllById(request.userIds());
		}

		for (User user : targets) {
			Notification n = new Notification();
			n.setUser(user);
			n.setTitle(request.title());
			n.setMessage(request.message());
			n.setIsRead(false);
			Notification saved = notificationRepository.save(n);

			NotificationDTO dto = new NotificationDTO(saved.getNotificationId(), saved.getUser().getUserId(),
					saved.getTitle(), saved.getMessage(), saved.getIsRead(), saved.getCreatedAt());

			socketService.sendToUser(user.getUsername(), dto);
		}
	}
}
