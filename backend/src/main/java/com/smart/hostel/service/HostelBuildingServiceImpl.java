package com.smart.hostel.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.HostelBuildingDTO;
import com.smart.hostel.entity.HostelBuilding;
import com.smart.hostel.entity.StaffBuildingMap;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.repository.HostelBuildingRepository;
import com.smart.hostel.repository.StaffBuildingMapRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class HostelBuildingServiceImpl implements HostelBuildingService {

	private final HostelBuildingRepository repository;
	private final StaffBuildingMapRepository mapRepository;

	@Override
	public HostelBuildingDTO create(HostelBuildingDTO dto) {
		HostelBuilding b = new HostelBuilding();
		b.setBuildingName(dto.buildingName());
		b.setBuildingType(dto.buildingType());
		b.setTotalRooms(dto.totalRooms());
		b.setTotalCapacity(dto.totalCapacity());
		b.setFee(dto.fee());

		if (dto.availableRooms() == null) {
			b.setAvailableRooms(dto.totalRooms());
		} else {
			b.setAvailableRooms(dto.availableRooms());
		}

		b.setCreatedAt(LocalDateTime.now());

		HostelBuilding saved = repository.save(b);

		return new HostelBuildingDTO(saved.getBuildingId(), saved.getBuildingName(), saved.getBuildingType(),
				saved.getTotalRooms(), saved.getTotalCapacity(), saved.getAvailableRooms(), saved.getFee(),
				saved.getCreatedAt(), null, null);
	}

	@Override
	public HostelBuildingDTO getById(Long id) {
		HostelBuilding b = repository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Building not found"));

		return convertToDto(b);
	}

	@Override
	public List<HostelBuildingDTO> getAll() {
		List<HostelBuildingDTO> list = new ArrayList<>();
		for (HostelBuilding b : repository.findAll()) {
			list.add(convertToDto(b));
		}
		return list;
	}

	@Override
	public List<HostelBuildingDTO> getWardenBuildings(String username) {
		List<HostelBuildingDTO> list = new ArrayList<>();
		List<StaffBuildingMap> maps = mapRepository.findByStaff_User_Username(username);
		for (StaffBuildingMap map : maps) {
			if (map.getBuilding() != null) {
				list.add(convertToDto(map.getBuilding()));
			}
		}
		return list;
	}

	private HostelBuildingDTO convertToDto(HostelBuilding b) {
		String wardenName = "Unassigned";
		Long wardenId = null;

		List<StaffBuildingMap> maps = mapRepository.findByBuilding(b);
		for (StaffBuildingMap map : maps) {
			if (map.getStaff() != null) {
				if (map.getStaff().getStaffType() != null
						&& "WARDEN".equalsIgnoreCase(map.getStaff().getStaffType().name())) {
					wardenName = map.getStaff().getFullName() + " (" + map.getStaff().getUser().getUsername() + ")";
					wardenId = map.getStaff().getStaffId();
					break;
				}
			}
		}

		return new HostelBuildingDTO(b.getBuildingId(), b.getBuildingName(), b.getBuildingType(), b.getTotalRooms(),
				b.getTotalCapacity(), b.getAvailableRooms(), b.getFee(), b.getCreatedAt(), wardenName, wardenId);
	}

	@Override
	public List<HostelBuildingDTO> getUnassignedBuildings() {
		List<HostelBuildingDTO> list = new ArrayList<>();
		for (HostelBuilding b : repository.findUnassignedBuildings()) {
			list.add(convertToDto(b));
		}
		return list;
	}
}
