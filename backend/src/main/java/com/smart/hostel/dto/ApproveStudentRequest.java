package com.smart.hostel.dto;

public record ApproveStudentRequest(Double totalFee, Boolean isEmiEnabled, Double emiAmount, String roomNumber) {
}
