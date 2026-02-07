package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.ApproveStudentRequest;
import com.smart.hostel.dto.RegistrationRequest;
import com.smart.hostel.dto.StudentDTO;
import com.smart.hostel.dto.StudentStatsDTO;
import com.smart.hostel.entity.Gender;
import com.smart.hostel.entity.StudentStatus;

public interface StudentService {
	StudentDTO register(StudentDTO dto);

	StudentDTO createPendingStudent(Long userId, String fullName, Gender gender, Double totalFee, Long buildingId,
			String roomNumber);

	StudentDTO registerByWarden(RegistrationRequest request, String wardenUsername);

	StudentDTO approve(Long studentId, Long buildingId, ApproveStudentRequest request);

	StudentDTO reject(Long studentId);

	List<StudentDTO> getByStatus(StudentStatus status);

	StudentStatsDTO getStats(String username);

	List<StudentDTO> searchStudents(String query);

	StudentDTO getStudentByUsername(String username);

	StudentDTO selectPaymentMethod(Long studentId, Boolean isEmi, Double emiAmount);

	StudentDTO createApprovedStudent(Long userId, String fullName, Gender gender, Double totalFee, Long buildingId,
			String roomNumber);

	StudentDTO updateStudentDetails(Long studentId, StudentDTO dto);

	List<StudentDTO> getStudentsByBuilding(Long buildingId);

	List<String> getAllocatedRooms(Long buildingId);
}