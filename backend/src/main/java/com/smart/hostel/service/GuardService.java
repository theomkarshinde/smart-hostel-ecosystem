package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.GuardDashboardStatsDTO;
import com.smart.hostel.dto.VisitorDTO;

public interface GuardService {
	VisitorDTO verifyAndLogVisitor(VisitorDTO dto);

	List<VisitorDTO> getRecentVisitors();

	GuardDashboardStatsDTO getDashboardStats();
}