package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.ComplaintDTO;
import com.smart.hostel.entity.ComplaintStatus;

public interface ComplaintService {
	ComplaintDTO raise(ComplaintDTO dto, String username);

	List<ComplaintDTO> getByStudent(Long studentId);

	List<ComplaintDTO> getByBuilding(Long buildingId, ComplaintStatus status);

	List<ComplaintDTO> getAllByBuilding(Long buildingId);

	List<ComplaintDTO> getMessComplaints();

	ComplaintDTO updateStatus(Long complaintId, ComplaintStatus status, String resolutionComment);
}
