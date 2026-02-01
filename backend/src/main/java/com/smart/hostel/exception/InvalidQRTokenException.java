package com.smart.hostel.exception;

public class InvalidQRTokenException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public InvalidQRTokenException(String message) {
        super(message);
    }
}
