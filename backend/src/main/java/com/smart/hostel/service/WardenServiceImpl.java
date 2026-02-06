package com.smart.hostel.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.WardenDashboardStatsDTO;
import com.smart.hostel.dto.WardenProfileDTO;
import com.smart.hostel.entity.HostelBuilding;
import com.smart.hostel.entity.Staff;
import com.smart.hostel.entity.StaffBuildingMap;
import com.smart.hostel.entity.StudentStatus;
import com.smart.hostel.repository.StaffBuildingMapRepository;
import com.smart.hostel.repository.StudentAttendanceRepository;
import com.smart.hostel.repository.StudentRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class WardenServiceImpl implements WardenService {

	private final StudentRepository studentRepository;
	private final StudentAttendanceRepository attendanceRepository;
	private final StaffBuildingMapRepository staffBuildingMapRepo;

	@Override
	public WardenDashboardStatsDTO getDashboardStats(String username) {
		List<StaffBuildingMap> maps = staffBuildingMapRepo.findByStaff_User_Username(username);

		if (maps.isEmpty()) {
			return new WardenDashboardStatsDTO(0, 0, 0, 0);
		}

		List<HostelBuilding> myBuildings = maps.stream().map(StaffBuildingMap::getBuilding)
				.collect(Collectors.toList());
		long totalStudents = studentRepository.findByStatus(StudentStatus.APPROVED).stream()
				.filter(s -> myBuildings.contains(s.getBuilding())).count();
		long pendingApprovals = studentRepository.findByStatus(StudentStatus.PENDING).size();

		long roomsAvailable = myBuildings.stream().mapToLong(HostelBuilding::getAvailableRooms).sum();

		long todaysAttendance = attendanceRepository.findByAttendanceDate(LocalDate.now()).stream()
				.filter(a -> myBuildings.contains(a.getBuilding())) // Attendance has building ref
				.map(a -> a.getStudent().getStudentId()).distinct().count();

		return new WardenDashboardStatsDTO(totalStudents, pendingApprovals, roomsAvailable, todaysAttendance);
	}

	@Override
	public WardenProfileDTO getProfile(String username) {
		List<StaffBuildingMap> maps = staffBuildingMapRepo.findByStaff_User_Username(username);

		Long buildingId = null;
		String buildingName = null;
		boolean managesMess = false;
		Long staffId = null;
		String fullName = "Warden";
		String email = null;
		String phoneNumber = null;

		if (!maps.isEmpty()) {
			StaffBuildingMap map = maps.get(0);
			Staff staff = map.getStaff();
			staffId = staff.getStaffId();
			fullName = staff.getFullName();

			managesMess = staff.getManagesMess() != null ? staff.getManagesMess() : false;

			if (staff.getUser() != null) {
				email = staff.getUser().getEmail();
				phoneNumber = staff.getUser().getPhoneNumber();
			}

			HostelBuilding b = map.getBuilding();
			buildingId = b.getBuildingId();
			buildingName = b.getBuildingName();
		} else {

		}

		log.debug("WardenProfile for {} -> BuildingId: {}, ManagesMess: {}", username, buildingId, managesMess);
		return new WardenProfileDTO(staffId, fullName, buildingId, buildingName, managesMess, email, phoneNumber);
	}
}
