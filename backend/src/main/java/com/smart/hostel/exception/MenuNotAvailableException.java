package com.smart.hostel.exception;

public class MenuNotAvailableException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public MenuNotAvailableException(String message) {
        super(message);
    }
}
