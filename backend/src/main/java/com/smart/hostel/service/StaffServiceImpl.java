package com.smart.hostel.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.StaffAttendanceDTO;
import com.smart.hostel.dto.StaffDTO;
import com.smart.hostel.dto.StaffDashboardStatsDTO;
import com.smart.hostel.dto.UserDTO;
import com.smart.hostel.entity.HostelBuilding;
import com.smart.hostel.entity.Staff;
import com.smart.hostel.entity.StaffAttendance;
import com.smart.hostel.entity.StaffBuildingMap;
import com.smart.hostel.entity.StaffType;
import com.smart.hostel.entity.User;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.repository.HostelBuildingRepository;
import com.smart.hostel.repository.StaffAttendanceRepository;
import com.smart.hostel.repository.StaffBuildingMapRepository;
import com.smart.hostel.repository.StaffRepository;
import com.smart.hostel.repository.UserRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class StaffServiceImpl implements StaffService {

	private final StaffRepository staffRepository;
	private final UserRepository userRepository;
	private final StaffAttendanceRepository attendanceRepository;
	private final StaffBuildingMapRepository staffBuildingMapRepo;
	private final HostelBuildingRepository buildingRepository;

	@Override
	public StaffDTO addStaff(StaffDTO dto) {

		Staff staff = new Staff();
		staff.setStaffType(dto.staffType());

		Staff saved = staffRepository.save(staff);

		if (dto.buildingIds() != null && !dto.buildingIds().isEmpty()) {
			for (Long bId : dto.buildingIds()) {
				try {
					HostelBuilding building = buildingRepository.findById(bId)
							.orElseThrow(() -> new ResourceNotFoundException("Building not found: " + bId));

					StaffBuildingMap map = new StaffBuildingMap();
					map.setStaff(saved);
					map.setBuilding(building);
					staffBuildingMapRepo.save(map);
				} catch (Exception e) {
					log.error("Failed to assign staff to building {}: {}", bId, e.getMessage());
				}
			}
		}

		return new StaffDTO(saved.getStaffId(), saved.getUser() != null ? saved.getUser().getUserId() : null,
				saved.getFullName(), saved.getStaffType(), null, false, null);
	}

	@Override
	public List<StaffDTO> getByType(StaffType type) {

		List<StaffDTO> result = new ArrayList<>();
		for (Staff s : staffRepository.findByStaffType(type)) {
			UserDTO uDto = null;
			Long userId = null;
			if (s.getUser() != null) {
				userId = s.getUser().getUserId();
				uDto = new UserDTO(s.getUser().getUserId(), s.getUser().getRole().getRoleId(),
						s.getUser().getRole().getRoleName(), s.getUser().getUsername(), s.getUser().getEmail(),
						s.getUser().getPhoneNumber(), s.getFullName(), null, // password
						s.getUser().getIsActive(), s.getUser().getCreatedAt());
			}

			result.add(new StaffDTO(s.getStaffId(), userId, s.getFullName(), s.getStaffType(), null, s.getManagesMess(),
					uDto));
		}
		return result;
	}

	@Override
	public StaffDashboardStatsDTO getDashboardStats(String username) {
		Staff staff = getStaffByUsername(username);

		List<StaffAttendance> attendanceList = attendanceRepository.findByStaff(staff);

		long daysPresent = attendanceList.stream().map(StaffAttendance::getAttendanceDate).distinct().count();

		long totalWorkingDays = LocalDate.now().getDayOfMonth();
		if (totalWorkingDays == 0)
			totalWorkingDays = 1;

		double percentage = ((double) daysPresent / totalWorkingDays) * 100;

		return new StaffDashboardStatsDTO(percentage, daysPresent, totalWorkingDays);
	}

	@Override
	public List<StaffAttendanceDTO> getAttendanceHistory(String username) {
		Staff staff = getStaffByUsername(username);
		List<StaffAttendance> list = attendanceRepository.findByStaff(staff);

		List<StaffAttendanceDTO> result = new ArrayList<>();
		for (StaffAttendance sa : list) {
			result.add(new StaffAttendanceDTO(sa.getStaffAttendanceId(), sa.getStaff().getStaffId(),
					sa.getBuilding().getBuildingId(), sa.getAction(), sa.getAttendanceDate(), sa.getAttendanceTime(),
					sa.getCreatedAt()));
		}
		return result;
	}

	private Staff getStaffByUsername(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		return staffRepository.findByUser(user)
				.orElseThrow(() -> new ResourceNotFoundException("Staff record not found"));
	}

	@Override
	public StaffDTO getProfile(String username) {
		Staff staff = getStaffByUsername(username);

		List<Long> buildingIds = new ArrayList<>();
		List<StaffBuildingMap> maps = staffBuildingMapRepo.findByStaff(staff);
		if (maps != null) {
			for (StaffBuildingMap map : maps) {
				if (map.getBuilding() != null) {
					buildingIds.add(map.getBuilding().getBuildingId());
				}
			}
		}

		UserDTO uDto = null;
		if (staff.getUser() != null) {
			uDto = new UserDTO(staff.getUser().getUserId(), staff.getUser().getRole().getRoleId(),
					staff.getUser().getRole().getRoleName(), staff.getUser().getUsername(), staff.getUser().getEmail(),
					staff.getUser().getPhoneNumber(), staff.getFullName(), null, staff.getUser().getIsActive(),
					staff.getUser().getCreatedAt());
		}

		return new StaffDTO(staff.getStaffId(), staff.getUser() != null ? staff.getUser().getUserId() : null,
				staff.getFullName(), staff.getStaffType(), buildingIds, staff.getManagesMess(), uDto);
	}

	@Override
	public List<StaffDTO> getUnassignedWardens() {
		List<Staff> wardens = staffRepository.findUnassignedWardens();
		List<StaffDTO> result = new ArrayList<>();
		for (Staff s : wardens) {
			UserDTO uDto = null;
			Long userId = null;
			if (s.getUser() != null) {
				userId = s.getUser().getUserId();
				uDto = new UserDTO(s.getUser().getUserId(), s.getUser().getRole().getRoleId(),
						s.getUser().getRole().getRoleName(), s.getUser().getUsername(), s.getUser().getEmail(),
						s.getUser().getPhoneNumber(), s.getFullName(), null, s.getUser().getIsActive(),
						s.getUser().getCreatedAt());
			}
			result.add(new StaffDTO(s.getStaffId(), userId, s.getFullName(), s.getStaffType(), null, s.getManagesMess(),
					uDto));
		}
		return result;
	}
}
