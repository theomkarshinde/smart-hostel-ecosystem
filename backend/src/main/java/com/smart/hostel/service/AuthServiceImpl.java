package com.smart.hostel.service;

import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import com.smart.hostel.dto.AuthRequest;
import com.smart.hostel.dto.AuthResponse;
import com.smart.hostel.dto.NotificationDTO;
import com.smart.hostel.dto.RegistrationRequest;
import com.smart.hostel.dto.UserDTO;
import com.smart.hostel.entity.Staff;
import com.smart.hostel.entity.User;
import com.smart.hostel.repository.StaffRepository;
import com.smart.hostel.security.JwtUtil;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final StudentService studentService;
    private final NotificationService notificationService;
    private final StaffRepository staffRepository;

    @Override
    public AuthResponse login(AuthRequest request) {
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

        return new AuthResponse(token, userDetails.getUsername(), role, userDto.userId(), userDto.roleId(),
                managesMess);
    }

    @Override
    @Transactional
    public UserDTO register(RegistrationRequest request) {
        log.info("Registering new user: {} with email: {}", request.username(), request.email());
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
                log.error("Failed to send registration notifications for user {}: {}", request.username(),
                        e.getMessage());
            }
        }

        log.info("User {} registered successfully with role {}", createdUser.username(), createdUser.roleName());
        return createdUser;
    }
}
