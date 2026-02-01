package com.smart.hostel.service;

import com.smart.hostel.dto.StudentMessDTO;

public interface StudentMessService {
	StudentMessDTO subscribe(StudentMessDTO dto);

	StudentMessDTO getSubscription(String username);
}
