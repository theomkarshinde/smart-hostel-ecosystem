package com.smart.hostel.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.AuthRequest;
import com.smart.hostel.dto.AuthResponse;
import com.smart.hostel.dto.NotificationDTO;
import com.smart.hostel.dto.RegistrationRequest;
import com.smart.hostel.dto.UserDTO;
import com.smart.hostel.entity.Staff;
import com.smart.hostel.entity.User;
import com.smart.hostel.repository.StaffRepository;
import com.smart.hostel.security.JwtUtil;
import com.smart.hostel.service.NotificationService;
import com.smart.hostel.service.StudentService;
import com.smart.hostel.service.UserService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController extends BaseApiController {

	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;
	private final UserService userService;
	private final StudentService studentService;
	private final NotificationService notificationService;
	private final StaffRepository staffRepository;

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
		Authentication authentication = authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));

		UserDetails userDetails = (UserDetails) authentication.getPrincipal();
		String token = jwtUtil.generateToken(userDetails);
		String role = userDetails.getAuthorities().stream().findFirst().get().getAuthority().replace("ROLE_", "");

		UserDTO userDto = userService.getByUsername(userDetails.getUsername());

		Boolean managesMess = false;
		if ("WARDEN".equals(role) || "STAFF".equals(role)) {
			User user = new User();
			user.setUserId(userDto.userId());
			managesMess = staffRepository.findByUser(user).map(Staff::getManagesMess).orElse(false);
		}

		return ResponseEntity.ok(new AuthResponse(token, userDetails.getUsername(), role, userDto.userId(),
				userDto.roleId(), managesMess));
	}

	@PostMapping("/register")
	public ResponseEntity<UserDTO> register(@RequestBody RegistrationRequest request) {
		UserDTO userDTO = new UserDTO(null, null, null, request.username(), request.email(), request.phoneNumber(),
				request.fullName(), request.password(), true, null);

		UserDTO createdUser = userService.createUser(userDTO);

		if ("STUDENT".equalsIgnoreCase(createdUser.roleName())) {
			Long bId = null;
			if (request.buildingIds() != null && !request.buildingIds().isEmpty()) {
				bId = request.buildingIds().get(0);
			}
			studentService.createPendingStudent(createdUser.userId(), request.fullName(), request.gender(),
					request.totalFee(), bId, request.roomNumber());

			try {
				List<UserDTO> wardens = userService.getUsersByRole("WARDEN");
				for (UserDTO warden : wardens) {
					NotificationDTO notif = new NotificationDTO(null, warden.userId(), "New Student Registration",
							"New Student Registration: " + request.fullName(), false, null);
					notificationService.send(notif);
				}
			} catch (Exception e) {

			}
		}

		return ResponseEntity.ok(createdUser);
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
		String username = request.get("username");
		userService.generateResetToken(username);
		return ResponseEntity.ok("Reset token generated");
	}

	@PostMapping("/reset-password")
	public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
		String token = request.get("token");
		String newPassword = request.get("newPassword");
		userService.resetPassword(token, newPassword);
		return ResponseEntity.ok("Password reset successfully");
	}
}
