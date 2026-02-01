package com.smart.hostel.exception;

public class UnsupportedAttendanceTypeException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public UnsupportedAttendanceTypeException(String message) {
        super(message);
    }
}
