package com.smart.hostel.dto;

public record StudentStatsDTO(String attendancePercentage, String messStatus, String roomNumber, String buildingName,
		Double walletBalance, Double totalFee, Double paidFee, Boolean isEmiEnabled, Double emiAmount, String status,
		Long studentId, Boolean paymentMethodSelected) {
}
