package com.smart.hostel.controller;

import java.security.Principal;
import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.PaymentDTO;
import com.smart.hostel.service.PaymentService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/payments")
@AllArgsConstructor
public class PaymentController extends BaseApiController {

	private final PaymentService paymentService;

	@PostMapping("/create-order")
	public ResponseEntity<String> createOrder(@RequestBody PaymentDTO dto) {
		return ResponseEntity.ok(paymentService.createRazorpayOrder(dto));
	}

	@PostMapping("/confirm")
	public ResponseEntity<PaymentDTO> confirm(@RequestBody PaymentDTO dto) {
		return ResponseEntity.ok(paymentService.confirmPayment(dto));
	}

	@PostMapping("/add-cash")
	public ResponseEntity<PaymentDTO> addCash(@RequestBody PaymentDTO dto) {
		return ResponseEntity.ok(paymentService.addCashPayment(dto));
	}

	@PostMapping("/{studentId}/pay-from-wallet")
	public ResponseEntity<PaymentDTO> payFromWallet(@PathVariable Long studentId,
			@RequestBody BigDecimal amount) {
		return ResponseEntity.ok(paymentService.payFeeFromWallet(studentId, amount));
	}

	@GetMapping("/history")
	public ResponseEntity<List<PaymentDTO>> getHistory(Principal principal) {
		return ResponseEntity.ok(paymentService.getHistory(principal.getName()));
	}
}
