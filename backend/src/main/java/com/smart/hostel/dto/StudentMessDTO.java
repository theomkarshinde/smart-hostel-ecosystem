package com.smart.hostel.dto;

import java.time.LocalDate;

public record StudentMessDTO(Long id, Long studentId, Integer planId, LocalDate startDate, LocalDate endDate,
		Integer remainingMeals) {
}
