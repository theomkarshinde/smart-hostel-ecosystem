package com.smart.hostel.exception;

public class PaymentCreationException extends RuntimeException {
    public PaymentCreationException(String message) {
        super(message);
    }
    
    public PaymentCreationException(String message, Throwable cause) {
        super(message, cause);
    }
}
