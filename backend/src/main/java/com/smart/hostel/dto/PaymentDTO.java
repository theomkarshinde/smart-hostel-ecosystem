package com.smart.hostel.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.smart.hostel.entity.PaymentType;

public record PaymentDTO(Long paymentId, Long studentId, BigDecimal amount, PaymentType paymentType,
		LocalDateTime paymentDate, String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
}
