package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.AdminDashboardStatsDTO;
import com.smart.hostel.dto.HostelBuildingDTO;
import com.smart.hostel.dto.RegistrationRequest;
import com.smart.hostel.dto.StaffDTO;
import com.smart.hostel.dto.UserDTO;

public interface AdminService {

	HostelBuildingDTO createBuilding(HostelBuildingDTO dto);

	StaffDTO createWarden(StaffDTO dto, Long buildingId);

	AdminDashboardStatsDTO getDashboardStats();

	UserDTO addStaff(RegistrationRequest request);

	List<StaffDTO> getAllStaff();

	StaffDTO updateStaff(Long staffId, StaffDTO dto);

	void deleteUser(String username);
}
