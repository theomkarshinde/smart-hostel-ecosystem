package com.smart.hostel.dto;

import com.smart.hostel.entity.Gender;
import com.smart.hostel.entity.StudentStatus;

public record StudentDTO(Long studentId, Long userId, String username, String fullName, Gender gender,
		StudentStatus status, Long buildingId, Double walletBalance, Double totalFee, Double paidFee,
		Boolean isEmiEnabled, Double emiAmount, String roomNumber, Boolean paymentMethodSelected, String email,
		String phoneNumber) {
}
