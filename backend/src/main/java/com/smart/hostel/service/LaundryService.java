package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.LaundryBookingDTO;

public interface LaundryService {
	LaundryBookingDTO book(LaundryBookingDTO dto);

	List<LaundryBookingDTO> getHistory(String username);

	LaundryBookingDTO updateStatus(Long bookingId, String status);

	List<LaundryBookingDTO> getAllBookings(String username);
}
