package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.UserDTO;

public interface UserService {
	UserDTO createUser(UserDTO dto);

	UserDTO getByUsername(String username);

	void generateResetToken(String username);

	void resetPassword(String token, String newPassword);

	List<UserDTO> getUsersByRole(String roleName);
}
