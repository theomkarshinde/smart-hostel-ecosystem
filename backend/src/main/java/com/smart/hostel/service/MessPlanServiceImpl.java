package com.smart.hostel.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import com.smart.hostel.exception.ResourceNotFoundException;

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

	@Override
	public MessPlanDTO update(Integer planId, MessPlanDTO dto) {
		MessPlan m = messPlanRepository.findById(planId)
				.orElseThrow(() -> new ResourceNotFoundException("Mess Plan not found: " + planId));
		m.setPlanName(dto.planName());
		m.setPerMealCost(dto.perMealCost());
		MessPlan saved = messPlanRepository.save(m);
		return new MessPlanDTO(saved.getPlanId(), saved.getPlanName(), saved.getPerMealCost());
	}

	@Override
	public void delete(Integer planId) {
		if (!messPlanRepository.existsById(planId)) {
			throw new ResourceNotFoundException("Mess Plan not found: " + planId);
		}
		messPlanRepository.deleteById(planId);
	}
}
