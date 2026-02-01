package com.smart.hostel.dto;

import java.math.BigDecimal;

public record MessPlanDTO(Integer planId, String planName, BigDecimal perMealCost) {
}
