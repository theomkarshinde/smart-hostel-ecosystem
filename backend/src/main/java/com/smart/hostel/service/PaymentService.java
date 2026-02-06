package com.smart.hostel.service;

import java.math.BigDecimal;
import java.util.List;

import com.smart.hostel.dto.PaymentDTO;

public interface PaymentService {

	String createRazorpayOrder(PaymentDTO dto);

	PaymentDTO confirmPayment(PaymentDTO dto);

	boolean verifyPaymentSignature(String orderId, String paymentId, String signature);

	List<PaymentDTO> getHistory(String username);

	PaymentDTO payFeeFromWallet(Long studentId, BigDecimal amount);

	PaymentDTO addCashPayment(PaymentDTO dto);
}
