package com.smart.hostel.service;

import com.smart.hostel.dto.WardenDashboardStatsDTO;
import com.smart.hostel.dto.WardenProfileDTO;

public interface WardenService {
	WardenDashboardStatsDTO getDashboardStats(String username);

	WardenProfileDTO getProfile(String username);
}
