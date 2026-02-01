package com.smart.hostel.dto;

import java.math.BigDecimal;

public record LaundryBookingDTO(Long bookingId, Long studentId, Integer clothesCount, BigDecimal amount,
		String status) {
}