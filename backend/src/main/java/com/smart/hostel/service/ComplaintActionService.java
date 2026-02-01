package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.ComplaintActionDTO;

public interface ComplaintActionService {
	ComplaintActionDTO takeAction(ComplaintActionDTO dto);

	List<ComplaintActionDTO> getByComplaint(Long complaintId);
}
