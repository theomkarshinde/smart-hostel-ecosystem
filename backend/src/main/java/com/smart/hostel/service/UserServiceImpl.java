package com.smart.hostel.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.smart.hostel.dto.UserDTO;
import com.smart.hostel.entity.Role;
import com.smart.hostel.entity.Student;
import com.smart.hostel.entity.User;
import com.smart.hostel.exception.InvalidTokenException;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.exception.TokenExpiredException;
import com.smart.hostel.exception.UserAlreadyExistsException;
import com.smart.hostel.repository.RoleRepository;
import com.smart.hostel.repository.StudentRepository;
import com.smart.hostel.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;
	private final StudentRepository studentRepository;

	@Override
	public UserDTO createUser(UserDTO dto) {
		if (userRepository.existsByUsername(dto.username())) {
			throw new UserAlreadyExistsException("Username '" + dto.username() + "' is already taken.");
		}
		if (dto.email() != null && userRepository.existsByEmail(dto.email())) {
			throw new UserAlreadyExistsException("Email '" + dto.email() + "' is already registered.");
		}

		User user = new User();
		user.setUsername(dto.username());
		if (dto.password() != null) {
			user.setPasswordHash(passwordEncoder.encode(dto.password()));
		}
		user.setIsActive(dto.isActive());
		user.setEmail(dto.email());
		user.setPhoneNumber(dto.phoneNumber());

		Integer roleId = dto.roleId();
		Role role;
		if (roleId == null) {
			role = roleRepository.findByRoleName("STUDENT")
					.orElseThrow(() -> new ResourceNotFoundException("Role not found: STUDENT"));
		} else {
			role = roleRepository.findById(roleId).orElseThrow(() -> new ResourceNotFoundException("Role not found"));
		}
		user.setRole(role);
		user.setCreatedAt(LocalDateTime.now());

		User saved = userRepository.save(user);

		return new UserDTO(saved.getUserId(), saved.getRole().getRoleId(), saved.getRole().getRoleName(),
				saved.getUsername(), saved.getEmail(), saved.getPhoneNumber(), dto.fullName(), null,
				saved.getIsActive(), saved.getCreatedAt());
	}

	@Override
	public UserDTO getByUsername(String username) {
		User user = userRepository.findByUsername(username).orElse(null);
		if (user == null)
			return null;

		String fullName = null;

		if ("STUDENT".equalsIgnoreCase(user.getRole().getRoleName())) {
			Student s = studentRepository.findByUser(user).orElse(null);
			if (s != null) {
				fullName = s.getFullName();
			}
		}

		return new UserDTO(user.getUserId(), user.getRole().getRoleId(), user.getRole().getRoleName(),
				user.getUsername(), user.getEmail(), user.getPhoneNumber(), fullName, null, user.getIsActive(),
				user.getCreatedAt());
	}

	@Value("${app.frontend.url}")
	private String frontendUrl;

	@Override
	public void generateResetToken(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		String token = UUID.randomUUID().toString();
		user.setResetToken(token);
		user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
		userRepository.save(user);

		String resetLink = frontendUrl + "/reset-password?token=" + token;
		String emailBody = "To reset your password, click the link below:\n" + resetLink;

		if (user.getEmail() != null && !user.getEmail().isEmpty()) {
			emailService.sendEmail(user.getEmail(), "Password Reset Request", emailBody);
		} else {
			log.warn("No email found for user {}. Reset link: {}", username, resetLink);
		}
	}

	@Override
	public void resetPassword(String token, String newPassword) {
		User user = userRepository.findByResetToken(token)
				.orElseThrow(() -> new InvalidTokenException("The password reset link is invalid."));

		if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
			throw new TokenExpiredException("The password reset link has expired.");
		}
		user.setPasswordHash(passwordEncoder.encode(newPassword));
		user.setResetToken(null);
		user.setResetTokenExpiry(null);
		userRepository.save(user);
	}

	@Override
	public List<UserDTO> getUsersByRole(String roleName) {
		List<User> users = userRepository.findByRole_RoleName(roleName);
		List<UserDTO> dtos = new ArrayList<>();
		for (User u : users) {
			dtos.add(new UserDTO(u.getUserId(), u.getRole().getRoleId(), u.getRole().getRoleName(), u.getUsername(),
					u.getEmail(), u.getPhoneNumber(), null, null, u.getIsActive(), u.getCreatedAt()));
		}
		return dtos;
	}
	
}
