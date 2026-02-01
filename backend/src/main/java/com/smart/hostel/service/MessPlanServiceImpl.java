package com.smart.hostel.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.MessPlanDTO;
import com.smart.hostel.entity.MessPlan;
import com.smart.hostel.repository.MessPlanRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MessPlanServiceImpl implements MessPlanService {

	private final MessPlanRepository messPlanRepository;

	@Override
	public MessPlanDTO create(MessPlanDTO dto) {
		MessPlan m = new MessPlan();
		m.setPlanName(dto.planName());
		m.setPerMealCost(dto.perMealCost());

		MessPlan saved = messPlanRepository.save(m);

		return new MessPlanDTO(saved.getPlanId(), saved.getPlanName(), saved.getPerMealCost());
	}

	@Override
	public List<MessPlanDTO> getAll() {
		List<MessPlanDTO> list = new ArrayList<>();
		for (MessPlan m : messPlanRepository.findAll()) {
			list.add(new MessPlanDTO(m.getPlanId(), m.getPlanName(), m.getPerMealCost()));
		}
		return list;
	}
}
