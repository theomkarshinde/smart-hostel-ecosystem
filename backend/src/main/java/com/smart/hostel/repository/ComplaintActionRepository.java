package com.smart.hostel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smart.hostel.entity.Complaint;
import com.smart.hostel.entity.ComplaintAction;

@Repository
public interface ComplaintActionRepository extends JpaRepository<ComplaintAction, Long> {

	List<ComplaintAction> findByComplaintOrderByActionTimeAsc(Complaint complaint);
}
