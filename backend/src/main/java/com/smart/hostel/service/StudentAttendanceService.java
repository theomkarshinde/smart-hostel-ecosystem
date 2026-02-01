package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.StudentAttendanceDTO;
import com.smart.hostel.entity.StudentAttendance;

public interface StudentAttendanceService {
	StudentAttendanceDTO mark(StudentAttendanceDTO dto);

	List<StudentAttendance> getByStudentId(Long studentId);
}