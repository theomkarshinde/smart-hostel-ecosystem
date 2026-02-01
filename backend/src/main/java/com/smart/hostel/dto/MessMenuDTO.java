package com.smart.hostel.dto;

import java.time.LocalDate;

import com.smart.hostel.entity.MealType;

public record MessMenuDTO(Long menuId, LocalDate menuDate, MealType mealType, String items, Double price) {
}
