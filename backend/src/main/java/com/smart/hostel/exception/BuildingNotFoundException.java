package com.smart.hostel.exception;

public class BuildingNotFoundException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public BuildingNotFoundException(String message) {
        super(message);
    }
}
