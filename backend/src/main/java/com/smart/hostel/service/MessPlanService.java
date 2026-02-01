package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.MessPlanDTO;

public interface MessPlanService {
	MessPlanDTO create(MessPlanDTO dto);

	List<MessPlanDTO> getAll();

	MessPlanDTO update(Integer planId, MessPlanDTO dto);

	void delete(Integer planId);
}
