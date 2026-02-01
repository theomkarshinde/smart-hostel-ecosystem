package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.StaffAttendanceDTO;
import com.smart.hostel.dto.StaffAttendanceStatusDTO;
import com.smart.hostel.dto.StudentAttendanceDTO;
import com.smart.hostel.entity.AttendanceType;

public interface AttendanceService {

	StudentAttendanceDTO markStudentAttendance(StudentAttendanceDTO dto);

	StaffAttendanceDTO markStaffAttendance(StaffAttendanceDTO dto);

	StudentAttendanceDTO markStudentAttendanceByQR(String qrToken, AttendanceType type);

	StudentAttendanceDTO markStudentAttendanceByUsername(String username, StudentAttendanceDTO dto);

	List<StudentAttendanceDTO> getStudentAttendance(String username);

	List<StaffAttendanceStatusDTO> getMarkableStaff(String username);
}
