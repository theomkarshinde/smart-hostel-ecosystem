package com.smart.hostel.exception;

public class AttendanceAlreadyMarkedException extends RuntimeException {
    public AttendanceAlreadyMarkedException(String message) {
        super(message);
    }
}
