package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.StaffBuildingMapDTO;

public interface StaffBuildingMapService {
	StaffBuildingMapDTO assign(StaffBuildingMapDTO dto);

	List<StaffBuildingMapDTO> getByStaff(Long staffId);

	List<StaffBuildingMapDTO> getByBuilding(Long buildingId);
}
