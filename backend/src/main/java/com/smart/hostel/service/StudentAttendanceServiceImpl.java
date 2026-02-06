package com.smart.hostel.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.NotificationDTO;
import com.smart.hostel.dto.StudentAttendanceDTO;
import com.smart.hostel.entity.AttendanceType;
import com.smart.hostel.entity.Student;
import com.smart.hostel.entity.StudentAttendance;
import com.smart.hostel.exception.InsufficientBalanceException;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.repository.StudentAttendanceRepository;
import com.smart.hostel.repository.StudentRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class StudentAttendanceServiceImpl implements StudentAttendanceService {

	private final StudentAttendanceRepository attendanceRepository;
	private final StudentRepository studentRepository;
	private final NotificationService notificationService;

	@Override
	public StudentAttendanceDTO mark(StudentAttendanceDTO dto) {

		Student student = studentRepository.findById(dto.studentId())
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));

		if (dto.attendanceType() == AttendanceType.MESS) {
			double mealCost = 50.0;
			if (student.getWalletBalance() < mealCost) {
				throw new InsufficientBalanceException("Insufficient wallet balance");
			}
			student.setWalletBalance(student.getWalletBalance() - mealCost);
			studentRepository.save(student);
		}

		StudentAttendance a = new StudentAttendance();
		a.setStudent(student);
		a.setAttendanceType(dto.attendanceType());
		a.setAttendanceDate(LocalDate.now());
		a.setAttendanceTime(LocalTime.now());
		a.setMealType(dto.mealType());
		a.setHostelAction(dto.hostelAction());

		StudentAttendance saved = attendanceRepository.save(a);

		if (student.getUser() != null) {
			try {
				String message = buildAttendanceMessage(saved);
				notificationService.send(new NotificationDTO(null, student.getUser().getUserId(), "Attendance Marked",
						message, false, null));
			} catch (Exception e) {
				log.error("Failed to send attendance notification to student {}: {}", student.getStudentId(),
						e.getMessage());
			}
		}

		return new StudentAttendanceDTO(saved.getAttendanceId(), saved.getStudent().getStudentId(),
				saved.getStudent().getBuilding() != null ? saved.getStudent().getBuilding().getBuildingId() : null,
				saved.getAttendanceType(), saved.getHostelAction(), saved.getMealType(), saved.getAttendanceDate(),
				saved.getAttendanceTime(), saved.getCreatedAt() != null ? saved.getCreatedAt().toLocalDate() : null);

	}

	private String buildAttendanceMessage(StudentAttendance attendance) {
		StringBuilder message = new StringBuilder();
		message.append("Your attendance has been marked: ");

		if (attendance.getAttendanceType() == AttendanceType.HOSTEL) {
			message.append("Hostel ").append(attendance.getHostelAction() != null ? attendance.getHostelAction() : "")
					.append(" at ").append(attendance.getAttendanceTime());
		} else if (attendance.getAttendanceType() == AttendanceType.MESS) {
			message.append("Mess - ").append(attendance.getMealType() != null ? attendance.getMealType() : "")
					.append(" at ").append(attendance.getAttendanceTime());
		}

		return message.toString();
	}

	@Override
	public List<StudentAttendance> getByStudentId(Long studentId) {
		return attendanceRepository.findByStudent_StudentIdOrderByAttendanceDateDesc(studentId);
	}
}
