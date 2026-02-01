package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.HostelBuildingDTO;

public interface HostelBuildingService {
	HostelBuildingDTO create(HostelBuildingDTO dto);

	HostelBuildingDTO getById(Long id);

	List<HostelBuildingDTO> getAll();

	List<HostelBuildingDTO> getWardenBuildings(String username);

	List<HostelBuildingDTO> getUnassignedBuildings();
}
