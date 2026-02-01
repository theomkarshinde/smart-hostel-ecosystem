package com.smart.hostel.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.NotificationDTO;
import com.smart.hostel.dto.StudentDTO;
import com.smart.hostel.dto.StudentStatsDTO;
import com.smart.hostel.entity.Gender;
import com.smart.hostel.entity.HostelBuilding;
import com.smart.hostel.entity.Student;
import com.smart.hostel.entity.StudentAttendance;
import com.smart.hostel.entity.StudentMess;
import com.smart.hostel.entity.StudentStatus;
import com.smart.hostel.entity.User;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.exception.RoomNotAvailableException;
import com.smart.hostel.exception.StudentNotFoundException;
import com.smart.hostel.exception.UserNotFoundException;
import com.smart.hostel.repository.HostelBuildingRepository;
import com.smart.hostel.repository.StudentAttendanceRepository;
import com.smart.hostel.repository.StudentMessRepository;
import com.smart.hostel.repository.StudentRepository;
import com.smart.hostel.repository.UserRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class StudentServiceImpl implements StudentService {

	private final StudentRepository studentRepository;
	private final HostelBuildingRepository buildingRepository;
	private final UserRepository userRepository;
	private final StudentAttendanceRepository attendanceRepository;
	private final StudentMessRepository messRepository;
	private final NotificationService notificationService;

	@Override
	public StudentDTO register(StudentDTO dto) {
		Student s = new Student();
		s.setFullName(dto.fullName());
		s.setGender(dto.gender());
		s.setStatus(StudentStatus.PENDING);

		Student saved = studentRepository.save(s);

		return mapToDTO(saved);
	}

	@Override
	public StudentDTO createPendingStudent(Long userId, String fullName, Gender gender, Double totalFee,
			Long buildingId, String roomNumber) {
		Student s = new Student();
		User user = new User();
		user.setUserId(userId);

		s.setUser(user);
		s.setFullName(fullName);
		s.setGender(gender);
		s.setStatus(StudentStatus.PENDING);

		s.setWalletBalance(0.0);
		s.setPaidFee(0.0);
		s.setIsEmiEnabled(false);
		s.setEmiAmount(0.0);

		if (buildingId != null) {
			HostelBuilding b = buildingRepository.findById(buildingId).orElse(null);
			if (b != null) {
				s.setBuilding(b);
				s.setTotalFee(b.getFee() != null ? b.getFee() : (totalFee != null ? totalFee : 0.0));
			} else {
				s.setTotalFee(totalFee != null ? totalFee : 0.0);
			}
		} else {
			s.setTotalFee(totalFee != null ? totalFee : 0.0);
		}

		if (roomNumber != null && !roomNumber.isEmpty()) {
			s.setRoomNumber(roomNumber);
		}

		Student saved = studentRepository.save(s);

		return mapToDTO(saved);
	}

	@Override
	public StudentDTO approve(Long studentId, Long buildingId, Double totalFee, Boolean isEmiEnabled, Double emiAmount,
			String roomNumber) {
		Student student = studentRepository.findById(studentId)
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));
		HostelBuilding building = buildingRepository.findById(buildingId)
				.orElseThrow(() -> new ResourceNotFoundException("Building not found"));

		validateRoomAvailability(building);
		updateStudentApprovalDetails(student, building, totalFee, isEmiEnabled, emiAmount, roomNumber);
		updateBuildingCapacity(building);

		studentRepository.save(student);
		buildingRepository.save(building);

		sendApprovalNotification(student);

		return mapToDTO(student);
	}

	private void validateRoomAvailability(HostelBuilding building) {
		if (building.getAvailableRooms() <= 0) {
			throw new RoomNotAvailableException("No rooms available in " + building.getBuildingName());
		}
	}

	private void updateStudentApprovalDetails(Student student, HostelBuilding building, Double totalFee,
			Boolean isEmiEnabled, Double emiAmount, String roomNumber) {
		student.setStatus(StudentStatus.APPROVED);
		student.setBuilding(building);
		if (roomNumber != null && !roomNumber.isEmpty()) {
			student.setRoomNumber(roomNumber);
		}

		Double finalFee = (building.getFee() != null) ? building.getFee() : totalFee;
		student.setTotalFee(finalFee);

		student.setIsEmiEnabled(isEmiEnabled);
		student.setEmiAmount(emiAmount);
	}

	private void updateBuildingCapacity(HostelBuilding building) {
		building.setAvailableRooms(building.getAvailableRooms() - 1);
	}

	private void sendApprovalNotification(Student student) {
		if (student.getUser() != null) {
			try {
				notificationService.send(new NotificationDTO(null, student.getUser().getUserId(),
						"Registration Approved",
						"Welcome! Your registration has been approved. Assigned Room: " + student.getRoomNumber(),
						false, null));
			} catch (Exception e) {
				log.error("Failed to send approval notification to student {}: {}", student.getStudentId(),
						e.getMessage());
			}
		}
	}

	@Override
	public StudentDTO reject(Long studentId) {
		Student s = studentRepository.findById(studentId)
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));
		s.setStatus(StudentStatus.REJECTED);
		studentRepository.save(s);

		if (s.getUser() != null) {
			try {
				notificationService.send(new NotificationDTO(null, s.getUser().getUserId(), "Registration Rejected",
						"Sorry, your hostel registration has been rejected. Please contact the warden for details.",
						false, null));
			} catch (Exception e) {
				log.error("Failed to send rejection notification: {}", e.getMessage());
			}
		}

		return mapToDTO(s);
	}

	@Override
	public List<StudentDTO> getByStatus(StudentStatus status) {
		List<Student> list = studentRepository.findByStatus(status);
		List<StudentDTO> dtos = new ArrayList<>();
		for (Student s : list) {
			dtos.add(mapToDTO(s));
		}
		return dtos;
	}

	@Override
	public StudentStatsDTO getStats(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not found"));
		Student student = studentRepository.findByUser(user).orElse(null);
		if (student == null) {
			return createDefaultStats();
		}

		String attendancePercentage = calculateAttendancePercentage(student);
		String messStatus = determineMessStatus(student);
		String roomNumber = (student.getRoomNumber() != null) ? student.getRoomNumber() : "N/A";
		String buildingName = (student.getBuilding() != null) ? student.getBuilding().getBuildingName()
				: "Not Assigned";

		return new StudentStatsDTO(attendancePercentage, messStatus, roomNumber, buildingName,
				student.getWalletBalance(), student.getTotalFee(), student.getPaidFee(), student.getIsEmiEnabled(),
				student.getEmiAmount(), student.getStatus().name(), student.getStudentId(),
				student.getPaymentMethodSelected());
	}

	private StudentStatsDTO createDefaultStats() {
		return new StudentStatsDTO("0%", "N/A", "N/A", "N/A", 0.0, 0.0, 0.0, false, 0.0, "UNKNOWN", null, false);
	}

	private String calculateAttendancePercentage(Student student) {
		List<StudentAttendance> attendances = attendanceRepository.findByStudent(student);
		int presentCount = attendances.size();

		if (student.getUser().getCreatedAt() != null) {
			LocalDate joinDate = student.getUser().getCreatedAt().toLocalDate();
			long totalDays = ChronoUnit.DAYS.between(joinDate, LocalDate.now()) + 1;
			if (totalDays > 0) {
				double pct = ((double) presentCount / totalDays) * 100.0;
				return String.format("%.0f%%", pct);
			}
		}
		return "0%";
	}

	private String determineMessStatus(Student student) {
		List<StudentMess> messSubs = messRepository.findByStudent(student);
		if (messSubs.isEmpty()) {
			return "Inactive";
		}
		StudentMess active = messSubs.get(messSubs.size() - 1);
		return active.getEndDate().isAfter(LocalDate.now()) ? "Active" : "Expired";
	}

	@Override
	public StudentDTO getStudentByUsername(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not found"));
		Student s = studentRepository.findByUser(user)
				.orElseThrow(() -> new StudentNotFoundException("Student not found"));

		return mapToDTO(s);
	}

	@Override
	public List<StudentDTO> searchStudents(String query) {
		List<Student> students = studentRepository.searchStudentsWithUser(query);
		List<StudentDTO> dtos = new ArrayList<>();
		for (Student s : students) {
			dtos.add(mapToDTO(s));
		}
		return dtos;
	}

	@Override
	public StudentDTO selectPaymentMethod(Long studentId, Boolean isEmi, Double emiAmount) {
		Student s = studentRepository.findById(studentId)
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));

		s.setIsEmiEnabled(isEmi);
		s.setEmiAmount(emiAmount != null ? emiAmount : 0.0);
		s.setPaymentMethodSelected(true);

		Student saved = studentRepository.save(s);
		return mapToDTO(saved);
	}

	@Override
	public StudentDTO createApprovedStudent(Long userId, String fullName, Gender gender, Double totalFee,
			Long buildingId, String roomNumber) {
		Student s = new Student();
		User user = new User();
		user.setUserId(userId);

		s.setUser(user);
		s.setFullName(fullName);
		s.setGender(gender);
		s.setStatus(StudentStatus.APPROVED);

		s.setWalletBalance(0.0);
		s.setPaidFee(0.0);
		s.setIsEmiEnabled(false);
		s.setEmiAmount(0.0);

		if (buildingId != null) {
			HostelBuilding b = buildingRepository.findById(buildingId).orElse(null);
			if (b != null) {
				s.setBuilding(b);
				s.setTotalFee(b.getFee() != null ? b.getFee() : (totalFee != null ? totalFee : 0.0));
				if (b.getAvailableRooms() > 0) {
					b.setAvailableRooms(b.getAvailableRooms() - 1);
					buildingRepository.save(b);
				}
			} else {
				s.setTotalFee(totalFee != null ? totalFee : 0.0);
			}
		} else {
			s.setTotalFee(totalFee != null ? totalFee : 0.0);
		}

		if (roomNumber != null && !roomNumber.isEmpty()) {
			s.setRoomNumber(roomNumber);
		}

		Student saved = studentRepository.save(s);
		return mapToDTO(saved);
	}

	@Override
	public StudentDTO updateStudentDetails(Long studentId, StudentDTO dto) {
		Student s = studentRepository.findById(studentId)
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));

		s.setFullName(dto.fullName());
		s.setGender(dto.gender());
		s.setRoomNumber(dto.roomNumber());

		if (s.getUser() != null) {
			User u = s.getUser();
			u.setEmail(dto.email());
			u.setPhoneNumber(dto.phoneNumber());
			userRepository.save(u);
		}

		Student saved = studentRepository.save(s);
		return mapToDTO(saved);
	}

	@Override
	public List<StudentDTO> getStudentsByBuilding(Long buildingId) {
		HostelBuilding b = buildingRepository.findById(buildingId)
				.orElseThrow(() -> new ResourceNotFoundException("Building not found"));
		List<Student> students = studentRepository.findByBuilding(b);
		List<StudentDTO> dtos = new ArrayList<>();
		for (Student st : students) {
			dtos.add(mapToDTO(st));
		}
		return dtos;
	}

	@Override
	public List<String> getAllocatedRooms(Long buildingId) {
		return studentRepository.findAllocatedRoomNumbersByBuildingId(buildingId);
	}

	private StudentDTO mapToDTO(Student s) {
		return new StudentDTO(s.getStudentId(), s.getUser() != null ? s.getUser().getUserId() : null,
				s.getUser() != null ? s.getUser().getUsername() : null, s.getFullName(), s.getGender(), s.getStatus(),
				s.getBuilding() != null ? s.getBuilding().getBuildingId() : null, s.getWalletBalance(), s.getTotalFee(),
				s.getPaidFee(), s.getIsEmiEnabled(), s.getEmiAmount(), s.getRoomNumber(), s.getPaymentMethodSelected(),
				s.getUser() != null ? s.getUser().getEmail() : null,
				s.getUser() != null ? s.getUser().getPhoneNumber() : null);
	}
}
