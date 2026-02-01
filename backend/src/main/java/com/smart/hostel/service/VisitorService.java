package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.VisitorDTO;
import com.smart.hostel.entity.VisitorStatus;

public interface VisitorService {
	VisitorDTO log(VisitorDTO dto);

	List<VisitorDTO> getByStudent(Long studentId);

	List<VisitorDTO> getRecent();

	VisitorDTO createRequest(VisitorDTO dto);

	VisitorDTO updateStatus(Long visitorId, VisitorStatus status);

	List<VisitorDTO> getPendingRequestsByBuilding(Long buildingId);
}
