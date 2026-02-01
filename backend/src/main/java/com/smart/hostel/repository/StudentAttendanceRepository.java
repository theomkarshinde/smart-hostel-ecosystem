package com.smart.hostel.repository;

import com.smart.hostel.entity.StudentAttendance;
import com.smart.hostel.entity.Student;
import com.smart.hostel.entity.MealType;
import com.smart.hostel.entity.AttendanceType;
import java.lang.Long;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentAttendanceRepository extends JpaRepository<StudentAttendance, Long> {

	List<StudentAttendance> findByStudentAndAttendanceDate(Student student, LocalDate attendanceDate);

	boolean existsByStudentAndAttendanceDateAndMealType(Student student, LocalDate attendanceDate, MealType mealType);

	List<StudentAttendance> findByStudent(Student student);

	List<StudentAttendance> findByStudent_StudentIdOrderByAttendanceDateDesc(Long studentId);

	List<StudentAttendance> findByAttendanceDate(LocalDate attendanceDate);

	Optional<StudentAttendance> findFirstByStudent_StudentIdAndAttendanceTypeOrderByAttendanceDateDescAttendanceTimeDesc(
			Long studentId, AttendanceType attendanceType);
}
