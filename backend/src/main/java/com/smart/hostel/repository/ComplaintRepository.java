package com.smart.hostel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smart.hostel.entity.Complaint;
import com.smart.hostel.entity.ComplaintCategory;
import com.smart.hostel.entity.ComplaintStatus;
import com.smart.hostel.entity.HostelBuilding;
import com.smart.hostel.entity.Student;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

	List<Complaint> findByStudentOrderByCreatedAtDesc(Student student);

	List<Complaint> findByBuildingOrderByCreatedAtDesc(HostelBuilding building);

	List<Complaint> findByBuildingAndStatusOrderByCreatedAtDesc(HostelBuilding building, ComplaintStatus status);

	List<Complaint> findByCategoryOrderByCreatedAtDesc(ComplaintCategory category);

	List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);

	long countByStatus(ComplaintStatus status);

	boolean existsByComplaintId(Long complaintId);
}
