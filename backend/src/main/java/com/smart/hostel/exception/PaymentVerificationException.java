package com.smart.hostel.exception;

public class PaymentVerificationException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public PaymentVerificationException(String message) {
        super(message);
    }
}
