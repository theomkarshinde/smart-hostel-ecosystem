package com.smart.hostel.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.MessMenuDTO;
import com.smart.hostel.entity.MessMenu;
import com.smart.hostel.repository.MessMenuRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MessMenuServiceImpl implements MessMenuService {

	private final MessMenuRepository repository;

	@Override
	public MessMenuDTO addMenu(MessMenuDTO dto) {
		List<MessMenu> existing = repository.findByMenuDateAndMealType(dto.menuDate(), dto.mealType());

		MessMenu menu;
		if (!existing.isEmpty()) {
			menu = existing.get(0);
		} else {
			menu = new MessMenu();
		}

		menu.setMenuDate(dto.menuDate());
		menu.setMealType(dto.mealType());
		menu.setItems(dto.items());
		menu.setPrice(dto.price() != null ? dto.price() : 0.0);

		MessMenu saved = repository.save(menu);

		return new MessMenuDTO(saved.getMenuId(), saved.getMenuDate(), saved.getMealType(), saved.getItems(),
				saved.getPrice());
	}

	@Override
	public List<MessMenuDTO> getMenuByDate(LocalDate date) {
		return repository.findByMenuDate(date).stream().map(m -> {
			return new MessMenuDTO(m.getMenuId(), m.getMenuDate(), m.getMealType(), m.getItems(), m.getPrice());
		}).toList();
	}
}
