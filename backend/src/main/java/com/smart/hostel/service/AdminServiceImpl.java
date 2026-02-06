package com.smart.hostel.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smart.hostel.dto.AdminDashboardStatsDTO;
import com.smart.hostel.dto.HostelBuildingDTO;
import com.smart.hostel.dto.RegistrationRequest;
import com.smart.hostel.dto.StaffDTO;
import com.smart.hostel.dto.UserDTO;
import com.smart.hostel.entity.ComplaintStatus;
import com.smart.hostel.entity.HostelBuilding;
import com.smart.hostel.entity.Role;
import com.smart.hostel.entity.Staff;
import com.smart.hostel.entity.StaffBuildingMap;
import com.smart.hostel.entity.StaffType;
import com.smart.hostel.entity.StudentStatus;
import com.smart.hostel.entity.User;
import com.smart.hostel.exception.BuildingNotFoundException;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.exception.RoleNotFoundException;
import com.smart.hostel.repository.ComplaintRepository;
import com.smart.hostel.repository.HostelBuildingRepository;
import com.smart.hostel.repository.RoleRepository;
import com.smart.hostel.repository.StaffBuildingMapRepository;
import com.smart.hostel.repository.StaffRepository;
import com.smart.hostel.repository.StudentRepository;
import com.smart.hostel.repository.UserRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

	private final HostelBuildingRepository buildingRepository;
	private final StudentRepository studentRepository;
	private final ComplaintRepository complaintRepository;
	private final StaffRepository staffRepository;
	private final UserService userService;
	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final StaffBuildingMapRepository staffBuildingMapRepository;

	@Override
	public AdminDashboardStatsDTO getDashboardStats() {
		log.debug("Fetching Dashboard Stats...");
		try {
			long totalStudents = studentRepository.countByStatus(StudentStatus.APPROVED);
			log.debug("totalStudents={}", totalStudents);

			long totalBuildings = buildingRepository.count();
			log.debug("totalBuildings={}", totalBuildings);

			long totalStaff = staffRepository.count();
			log.debug("totalStaff={}", totalStaff);

			long pendingComplaints = complaintRepository.countByStatus(ComplaintStatus.OPEN);
			log.debug("pendingComplaints={}", pendingComplaints);

			return new AdminDashboardStatsDTO(totalStudents, totalBuildings, totalStaff, pendingComplaints);
		} catch (Exception e) {
			log.error("Failed to fetch dashboard stats: {}", e.getMessage());
			e.printStackTrace();
			throw e;
		}
	}

	@Override
	public HostelBuildingDTO createBuilding(HostelBuildingDTO dto) {
		HostelBuilding b = new HostelBuilding();
		b.setBuildingName(dto.buildingName());
		b.setBuildingType(dto.buildingType());
		b.setTotalRooms(dto.totalRooms());
		b.setTotalCapacity(dto.totalCapacity());
		b.setAvailableRooms(dto.totalRooms());
		b.setFee(dto.fee());

		HostelBuilding saved = buildingRepository.save(b);
		return new HostelBuildingDTO(saved.getBuildingId(), saved.getBuildingName(), saved.getBuildingType(),
				saved.getTotalRooms(), saved.getTotalCapacity(), saved.getAvailableRooms(), saved.getFee(),
				saved.getCreatedAt(), null, null);
	}

	@Override
	public StaffDTO createWarden(StaffDTO dto, Long buildingId) {
		Staff staff = new Staff();
		staff.setStaffType(StaffType.WARDEN);
		Staff saved = staffRepository.save(staff);

		if (buildingId != null) {
			try {
				HostelBuilding building = buildingRepository.findById(buildingId)
						.orElseThrow(() -> new BuildingNotFoundException("Building not found: " + buildingId));

				StaffBuildingMap map = new StaffBuildingMap();
				map.setStaff(saved);
				map.setBuilding(building);
				staffBuildingMapRepository.save(map);
			} catch (Exception e) {
				log.error("Failed to assign warden to building: {}", e.getMessage());
			}
		}

		return new StaffDTO(saved.getStaffId(), null, saved.getFullName(), saved.getStaffType(),
				buildingId != null ? Collections.singletonList(buildingId) : null, false, null);
	}

	@Override
	public UserDTO addStaff(RegistrationRequest request) {
		String roleName = (request.staffType() != null && !request.staffType().isEmpty()) ? request.staffType()
				: "STAFF";

		Role role = resolveRole(roleName);
		UserDTO userDTO = mapToUserDTO(request, role);
		UserDTO createdUser = userService.createUser(userDTO);

		Staff staff = createStaffEntity(createdUser, request, roleName);
		Staff savedStaff = staffRepository.save(staff);

		if (request.buildingIds() != null && !request.buildingIds().isEmpty()) {
			assignStaffToBuildings(savedStaff, request.buildingIds(), roleName);
		}

		return createdUser;
	}

	private Role resolveRole(String roleName) {
		try {
			return roleRepository.findByRoleName(roleName)
					.orElseThrow(() -> new RoleNotFoundException("Role not found: " + roleName));
		} catch (Exception e) {
			return roleRepository.findByRoleName("STAFF")
					.orElseThrow(() -> new RoleNotFoundException("Role not found: STAFF"));
		}
	}

	private UserDTO mapToUserDTO(RegistrationRequest request, Role role) {
		return new UserDTO(null, role.getRoleId(), role.getRoleName(), request.username(), request.email(),
				request.phoneNumber(), request.fullName(), request.password(), true, null);
	}

	private Staff createStaffEntity(UserDTO createdUser, RegistrationRequest request, String roleName) {
		Staff staff = new Staff();
		User user = new User();
		user.setUserId(createdUser.userId());
		staff.setUser(user);
		staff.setFullName(request.fullName() != null ? request.fullName() : request.username());
		staff.setManagesMess(request.managesMess() != null ? request.managesMess() : false);

		try {
			staff.setStaffType(StaffType.valueOf(roleName));
		} catch (Exception e) {
			log.warn("Invalid StaffType: {}. Defaulting to CLEANER.", roleName);
			staff.setStaffType(StaffType.CLEANER);
		}
		return staff;
	}

	private void assignStaffToBuildings(Staff staff, List<Long> buildingIds, String staffType) {
		List<Long> targets = buildingIds;
		if ("WARDEN".equals(staffType) && targets.size() > 1) {
			targets = List.of(targets.get(0));
		}

		for (Long bId : targets) {
			try {
				HostelBuilding building = buildingRepository.findById(bId)
						.orElseThrow(() -> new ResourceNotFoundException("Building not found: " + bId));

				StaffBuildingMap map = new StaffBuildingMap();
				map.setStaff(staff);
				map.setBuilding(building);
				staffBuildingMapRepository.save(map);
			} catch (Exception e) {
				log.error("Failed to assign staff to building {}: {}", bId, e.getMessage());
			}
		}
	}

	@Override
	public List<StaffDTO> getAllStaff() {
		return staffRepository.findAll().stream().map(this::mapToStaffDTO).toList();
	}

	@Override
	@Transactional
	public StaffDTO updateStaff(Long staffId, StaffDTO dto) {
		Staff staff = staffRepository.findById(staffId)
				.orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

		staff.setFullName(dto.fullName());
		staff.setManagesMess(dto.managesMess());

		if (staff.getUser() != null && dto.user() != null) {
			User user = staff.getUser();
			user.setEmail(dto.user().email());
			user.setPhoneNumber(dto.user().phoneNumber());
			userRepository.save(user);
		}

		staffBuildingMapRepository.deleteByStaff(staff);
		if (dto.buildingIds() != null) {
			assignStaffToBuildings(staff, dto.buildingIds(), staff.getStaffType().name());
		}

		Staff saved = staffRepository.save(staff);
		return mapToStaffDTO(saved);
	}

	private StaffDTO mapToStaffDTO(Staff staff) {
		List<Long> buildingIds = staffBuildingMapRepository.findByStaff(staff).stream()
				.map(m -> m.getBuilding().getBuildingId()).toList();

		UserDTO userDTO = null;
		if (staff.getUser() != null) {
			User u = staff.getUser();
			userDTO = new UserDTO(u.getUserId(), u.getRole() != null ? u.getRole().getRoleId() : null,
					u.getRole() != null ? u.getRole().getRoleName() : null, null, u.getEmail(), u.getPhoneNumber(),
					staff.getFullName(), null, u.getIsActive(), u.getCreatedAt());
		}

		return new StaffDTO(staff.getStaffId(), staff.getUser() != null ? staff.getUser().getUserId() : null,
				staff.getFullName(), staff.getStaffType(), buildingIds, staff.getManagesMess(), userDTO);
	}

	@Override
	public void deleteUser(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		userRepository.delete(user);
	}
}
