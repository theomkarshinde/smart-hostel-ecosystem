package com.smart.hostel.service;

import org.springframework.stereotype.Service;

import com.smart.hostel.entity.Staff;
import com.smart.hostel.entity.User;
import com.smart.hostel.repository.StaffRepository;
import com.smart.hostel.repository.UserRepository;

import lombok.AllArgsConstructor;

@Service("securityService")
@AllArgsConstructor
public class SecurityService {

	private final UserRepository userRepository;
	private final StaffRepository staffRepository;

	public boolean isMessWarden(String username) {
		User user = userRepository.findByUsername(username).orElse(null);
		if (user == null)
			return false;

		if (user.getRole().getRoleName().equals("ADMIN"))
			return true;

		Staff staff = staffRepository.findByUser(user).orElse(null);
		if (staff == null)
			return false;

		return staff.getManagesMess() != null && staff.getManagesMess();
	}
}
