package com.smart.hostel.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smart.hostel.entity.Staff;
import com.smart.hostel.entity.StaffAttendance;

@Repository
public interface StaffAttendanceRepository extends JpaRepository<StaffAttendance, Long> {

	List<StaffAttendance> findByStaffAndAttendanceDate(Staff staff, LocalDate attendanceDate);

	List<StaffAttendance> findByAttendanceDate(LocalDate attendanceDate);

	List<StaffAttendance> findByStaff(Staff staff);
}
