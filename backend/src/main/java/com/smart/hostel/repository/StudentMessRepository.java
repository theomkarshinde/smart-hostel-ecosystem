package com.smart.hostel.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smart.hostel.entity.Student;
import com.smart.hostel.entity.StudentMess;

@Repository
public interface StudentMessRepository extends JpaRepository<StudentMess, Long> {

	List<StudentMess> findByStudent(Student student);

	@Query("SELECT sm FROM StudentMess sm WHERE sm.student = :student AND :date BETWEEN sm.startDate AND sm.endDate")
	List<StudentMess> findActiveSubscription(@Param("student") Student student,
			@Param("date") LocalDate date);
	
}
