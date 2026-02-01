package com.smart.hostel.service.attendance;

import com.smart.hostel.dto.StudentAttendanceDTO;
import com.smart.hostel.entity.AttendanceType;
import com.smart.hostel.entity.Student;

public interface AttendanceStrategy {
	boolean supports(AttendanceType type);

	StudentAttendanceDTO mark(Student student, AttendanceType type);
}
