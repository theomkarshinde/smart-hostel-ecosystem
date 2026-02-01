package com.smart.hostel.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smart.hostel.entity.Student;
import com.smart.hostel.entity.Visitor;
import com.smart.hostel.entity.VisitorStatus;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {

	List<Visitor> findByStudent(Student student);

	List<Visitor> findByStudent_Building_BuildingIdAndStatus(Long buildingId, VisitorStatus status);

	long countByStatus(VisitorStatus status);

	long countByVisitDateBetween(LocalDateTime start, LocalDateTime end);
}
