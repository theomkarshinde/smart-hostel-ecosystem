package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.StaffAttendanceDTO;
import com.smart.hostel.dto.StaffDTO;
import com.smart.hostel.dto.StaffDashboardStatsDTO;
import com.smart.hostel.entity.StaffType;

public interface StaffService {

	StaffDTO addStaff(StaffDTO dto);

	List<StaffDTO> getByType(StaffType type);

	StaffDashboardStatsDTO getDashboardStats(String username);

	List<StaffAttendanceDTO> getAttendanceHistory(String username);

	StaffDTO getProfile(String username);

	List<StaffDTO> getUnassignedWardens();
}