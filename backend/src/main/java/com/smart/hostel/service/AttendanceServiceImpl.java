package com.smart.hostel.service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.StaffAttendanceDTO;
import com.smart.hostel.dto.StaffAttendanceStatusDTO;
import com.smart.hostel.dto.StaffDTO;
import com.smart.hostel.dto.StudentAttendanceDTO;
import com.smart.hostel.entity.AttendanceType;
import com.smart.hostel.entity.HostelAction;
import com.smart.hostel.entity.Staff;
import com.smart.hostel.entity.StaffAttendance;
import com.smart.hostel.entity.StaffBuildingMap;
import com.smart.hostel.entity.StaffType;
import com.smart.hostel.entity.Student;
import com.smart.hostel.entity.User;
import com.smart.hostel.exception.InvalidQRTokenException;
import com.smart.hostel.exception.StaffNotFoundException;
import com.smart.hostel.exception.StudentNotFoundException;
import com.smart.hostel.exception.UnsupportedAttendanceTypeException;
import com.smart.hostel.exception.UserNotFoundException;
import com.smart.hostel.repository.StaffAttendanceRepository;
import com.smart.hostel.repository.StaffBuildingMapRepository;
import com.smart.hostel.repository.StaffRepository;
import com.smart.hostel.repository.StudentRepository;
import com.smart.hostel.repository.UserRepository;
import com.smart.hostel.service.attendance.AttendanceStrategy;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@AllArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

	private final StudentAttendanceService studentAttendanceService;
	private final StaffAttendanceService staffAttendanceService;
	private final QRCodeService qrCodeService;
	private final StudentRepository studentRepository;
	private final UserRepository userRepository;
	private final StaffRepository staffRepository;
	private final StaffBuildingMapRepository staffBuildingMapRepository;
	private final StaffAttendanceRepository staffAttendanceRepository;
	private final List<AttendanceStrategy> attendanceStrategies;

	@Override
	public StudentAttendanceDTO markStudentAttendance(StudentAttendanceDTO dto) {
		return studentAttendanceService.mark(dto);
	}

	@Override
	public StaffAttendanceDTO markStaffAttendance(StaffAttendanceDTO dto) {
		return staffAttendanceService.mark(dto);
	}

	@Override
	public StudentAttendanceDTO markStudentAttendanceByQR(String qrToken, AttendanceType type) {
		if (!qrCodeService.validateQrToken(qrToken)) {
			log.error("expired token: {}", qrToken);
			throw new InvalidQRTokenException(
					"QR code is invalid or has expired. Please refresh the QR code on the student device.");
		}
		String username = qrCodeService.getUsernameFromQrToken(qrToken);

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		Student student = studentRepository.findByUser(user)
				.orElseThrow(() -> new StudentNotFoundException("Student not found"));

		return attendanceStrategies.stream().filter(s -> s.supports(type)).findFirst()
				.orElseThrow(() -> new UnsupportedAttendanceTypeException("Unsupported attendance type: " + type))
				.mark(student, type);
	}

	public StudentAttendanceDTO markStudentAttendanceByUsername(String username, StudentAttendanceDTO dto) {

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not found for username: " + username));

		Student student = studentRepository.findByUser(user)
				.orElseThrow(() -> new StudentNotFoundException("Student not found for user: " + username));

		return attendanceStrategies.stream().filter(s -> s.supports(dto.attendanceType())).findFirst().orElseThrow(
				() -> new UnsupportedAttendanceTypeException("Unsupported attendance type: " + dto.attendanceType()))
				.mark(student, dto.attendanceType());
	}

	@Override
	public List<StudentAttendanceDTO> getStudentAttendance(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not found"));
		Student student = studentRepository.findByUser(user).orElse(null);
		if (student == null) {
			throw new StudentNotFoundException("Student profile not found");
		}

		return studentAttendanceService.getByStudentId(student.getStudentId()).stream()
				.map(a -> new StudentAttendanceDTO(a.getAttendanceId(), a.getStudent().getStudentId(),
						a.getStudent().getBuilding() != null ? a.getStudent().getBuilding().getBuildingId() : null,
						a.getAttendanceType(), a.getHostelAction(), a.getMealType(), a.getAttendanceDate(),
						a.getAttendanceTime(), a.getCreatedAt() != null ? a.getCreatedAt().toLocalDate() : null))
				.toList();
	}

	@Override
	public List<StaffAttendanceStatusDTO> getMarkableStaff(String username) {
		User currentUser = userRepository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not found"));
		String role = currentUser.getRole().getRoleName();

		Set<Staff> staffSet = new HashSet<>();
		if (role.equals("ADMIN")) {
			staffSet.addAll(staffRepository.findAll());
		} else if (role.equals("WARDEN")) {
			staffSet.addAll(getStaffForWarden(currentUser));
		}

		return staffSet.stream().map(s -> mapToStaffAttendanceStatusDTO(s, currentUser)).collect(Collectors.toList());
	}

	private Set<Staff> getStaffForWarden(User wardenUser) {
		Staff warden = staffRepository.findByUser(wardenUser)
				.orElseThrow(() -> new StaffNotFoundException("Staff profile not found"));
		Set<Staff> staffSet = new HashSet<>();

		staffBuildingMapRepository.findByStaff(warden).stream().map(m -> m.getBuilding())
				.flatMap(b -> staffBuildingMapRepository.findByBuilding(b).stream()).map(m -> m.getStaff())
				.filter(s -> s.getStaffType() != StaffType.WARDEN || s.getStaffId().equals(warden.getStaffId()))
				.forEach(staffSet::add);

		if (Boolean.TRUE.equals(warden.getManagesMess())) {
			staffSet.addAll(staffRepository.findByStaffType(StaffType.MESS));
		}

		List<Staff> allStaff = staffRepository.findAll();
		for (Staff staff : allStaff) {
			if (staff.getStaffType() == StaffType.WARDEN && !staff.getStaffId().equals(warden.getStaffId())) {
				continue;
			}

			List<StaffBuildingMap> staffBuildings = staffBuildingMapRepository.findByStaff(staff);
			if (staffBuildings.isEmpty() && staff.getStaffType() != StaffType.WARDEN) {
				staffSet.add(staff);
			}
		}

		return staffSet;
	}

	private StaffAttendanceStatusDTO mapToStaffAttendanceStatusDTO(Staff staff, User currentUser) {
		List<StaffAttendance> todayAttendance = staffAttendanceRepository.findByStaffAndAttendanceDate(staff,
				LocalDate.now());

		boolean isMarkedIn = todayAttendance.stream().anyMatch(a -> a.getAction() == HostelAction.IN);
		boolean isMarkedOut = todayAttendance.stream().anyMatch(a -> a.getAction() == HostelAction.OUT);

		Long buildingId = determineBuildingIdForStaff(staff, currentUser);

		StaffDTO sDto = new StaffDTO(staff.getStaffId(), staff.getUser() != null ? staff.getUser().getUserId() : null,
				staff.getFullName(), staff.getStaffType(),
				buildingId != null ? Collections.singletonList(buildingId) : null, staff.getManagesMess(), null);

		return new StaffAttendanceStatusDTO(sDto, isMarkedIn, isMarkedOut);
	}

	private Long determineBuildingIdForStaff(Staff staff, User currentUser) {
		Staff currentStaff = staffRepository.findByUser(currentUser).orElse(null);
		if (currentStaff != null) {
			List<Long> wardenBuildingIds = staffBuildingMapRepository.findByStaff(currentStaff).stream()
					.map(m -> m.getBuilding().getBuildingId()).toList();

			return staffBuildingMapRepository.findByStaff(staff).stream().map(m -> m.getBuilding().getBuildingId())
					.filter(wardenBuildingIds::contains).findFirst()
					.orElse(staffBuildingMapRepository.findByStaff(staff).stream()
							.map(m -> m.getBuilding().getBuildingId()).findFirst().orElse(null));
		}
		return staffBuildingMapRepository.findByStaff(staff).stream().map(m -> m.getBuilding().getBuildingId())
				.findFirst().orElse(null);
	}
}
