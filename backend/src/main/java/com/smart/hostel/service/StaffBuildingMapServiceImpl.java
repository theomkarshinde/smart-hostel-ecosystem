package com.smart.hostel.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.StaffBuildingMapDTO;
import com.smart.hostel.entity.HostelBuilding;
import com.smart.hostel.entity.Staff;
import com.smart.hostel.entity.StaffBuildingMap;
import com.smart.hostel.entity.StaffType;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.repository.HostelBuildingRepository;
import com.smart.hostel.repository.StaffBuildingMapRepository;
import com.smart.hostel.repository.StaffRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class StaffBuildingMapServiceImpl implements StaffBuildingMapService {

	private final StaffBuildingMapRepository mapRepository;
	private final StaffRepository staffRepository;
	private final HostelBuildingRepository buildingRepository;

	@Override
	public StaffBuildingMapDTO assign(StaffBuildingMapDTO dto) {
		Staff staff = staffRepository.findById(dto.staffId())
				.orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
		HostelBuilding building = buildingRepository.findById(dto.buildingId())
				.orElseThrow(() -> new ResourceNotFoundException("Building not found"));

		if (mapRepository.existsByStaffAndBuilding(staff, building)) {
			throw new RuntimeException("Staff already assigned to this building");
		}

		if (staff.getStaffType() == StaffType.WARDEN) {
			List<StaffBuildingMap> existing = mapRepository.findByStaff(staff);
			if (!existing.isEmpty()) {
				throw new RuntimeException("Warden is already assigned to another building: "
						+ existing.get(0).getBuilding().getBuildingName());
			}

			List<StaffBuildingMap> buildingMaps = mapRepository.findByBuilding(building);
			for (StaffBuildingMap m : buildingMaps) {
				if (m.getStaff().getStaffType() == StaffType.WARDEN) {
					throw new RuntimeException("Building already has a warden: " + m.getStaff().getFullName());
				}
			}
		}

		StaffBuildingMap map = new StaffBuildingMap();
		map.setStaff(staff);
		map.setBuilding(building);

		StaffBuildingMap saved = mapRepository.save(map);

		return new StaffBuildingMapDTO(saved.getId(), saved.getStaff().getStaffId(),
				saved.getBuilding().getBuildingId());
	}

	@Override
	public List<StaffBuildingMapDTO> getByStaff(Long staffId) {
		Staff staff = staffRepository.findById(staffId)
				.orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
		List<StaffBuildingMapDTO> list = new ArrayList<>();

		for (StaffBuildingMap map : mapRepository.findByStaff(staff)) {
			list.add(new StaffBuildingMapDTO(map.getId(), map.getStaff().getStaffId(),
					map.getBuilding().getBuildingId()));
		}
		return list;
	}

	@Override
	public List<StaffBuildingMapDTO> getByBuilding(Long buildingId) {
		HostelBuilding building = buildingRepository.findById(buildingId)
				.orElseThrow(() -> new ResourceNotFoundException("Building not found"));
		List<StaffBuildingMapDTO> list = new ArrayList<>();

		for (StaffBuildingMap map : mapRepository.findByBuilding(building)) {
			list.add(new StaffBuildingMapDTO(map.getId(), map.getStaff().getStaffId(),
					map.getBuilding().getBuildingId()));
		}
		return list;
	}
}
