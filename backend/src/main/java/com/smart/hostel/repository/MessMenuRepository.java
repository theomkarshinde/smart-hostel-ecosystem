package com.smart.hostel.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smart.hostel.entity.MealType;
import com.smart.hostel.entity.MessMenu;

@Repository
public interface MessMenuRepository extends JpaRepository<MessMenu, Long> {
	List<MessMenu> findByMenuDate(LocalDate menuDate);

	List<MessMenu> findByMenuDateAndMealType(LocalDate menuDate, MealType mealType);
}
