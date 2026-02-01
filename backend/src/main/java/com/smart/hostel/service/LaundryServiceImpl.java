package com.smart.hostel.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.LaundryBookingDTO;
import com.smart.hostel.dto.NotificationDTO;
import com.smart.hostel.entity.LaundryBooking;
import com.smart.hostel.entity.Payment;
import com.smart.hostel.entity.PaymentType;
import com.smart.hostel.entity.StaffBuildingMap;
import com.smart.hostel.entity.Student;
import com.smart.hostel.entity.User;
import com.smart.hostel.exception.InsufficientBalanceException;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.exception.StudentNotFoundException;
import com.smart.hostel.exception.UserNotFoundException;
import com.smart.hostel.repository.LaundryBookingRepository;
import com.smart.hostel.repository.StudentRepository;
import com.smart.hostel.repository.UserRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class LaundryServiceImpl implements LaundryService {

	private final LaundryBookingRepository bookingRepository;
	private final UserRepository userRepository;
	private final StudentRepository studentRepository;
	private final NotificationService notificationService;
	private final com.smart.hostel.repository.PaymentRepository paymentRepository;
	private final com.smart.hostel.repository.StaffBuildingMapRepository staffBuildingMapRepo;

	@Override
	public LaundryBookingDTO book(LaundryBookingDTO dto) {

		Student student = studentRepository.findById(dto.studentId())
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));

		if (student.getWalletBalance() < dto.amount().doubleValue()) {
			throw new InsufficientBalanceException("Insufficient wallet balance. You need ₹" + dto.amount()
					+ " but only have ₹" + student.getWalletBalance());
		}

		LaundryBooking booking = new LaundryBooking();
		booking.setStudent(student);
		booking.setBuilding(student.getBuilding());
		booking.setClothesCount(dto.clothesCount());
		booking.setAmount(dto.amount());
		booking.setStatus("BOOKED");

		LaundryBooking saved = bookingRepository.save(booking);

		return new LaundryBookingDTO(saved.getBookingId(), saved.getStudent().getStudentId(), saved.getClothesCount(),
				saved.getAmount(), saved.getStatus());
	}

	@Override
	public List<LaundryBookingDTO> getHistory(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not found"));
		Student student = studentRepository.findByUser(user)
				.orElseThrow(() -> new StudentNotFoundException("Student not found"));

		List<LaundryBooking> list = bookingRepository.findByStudent(student);

		return list.stream().map(l -> {
			return new LaundryBookingDTO(l.getBookingId(), l.getStudent().getStudentId(), l.getClothesCount(),
					l.getAmount(), l.getStatus());
		}).toList();
	}

	@Override
	public LaundryBookingDTO updateStatus(Long bookingId, String status) {
		LaundryBooking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

		if ("WASHED".equalsIgnoreCase(status) && !"WASHED".equalsIgnoreCase(booking.getStatus())
				&& !"DELIVERED".equalsIgnoreCase(booking.getStatus())) {
			Student student = booking.getStudent();
			Double amount = booking.getAmount().doubleValue();

			if (student.getWalletBalance() < amount) {
				throw new InsufficientBalanceException(
						"Insufficient wallet balance for student " + student.getFullName() + ". Required: ₹" + amount);
			}
			student.setWalletBalance(student.getWalletBalance() - amount);
			studentRepository.save(student);

			Payment payment = new Payment();
			payment.setStudent(student);
			payment.setAmount(booking.getAmount().negate());
			payment.setPaymentType(PaymentType.LAUNDRY);
			payment.setPaymentDate(LocalDateTime.now());
			paymentRepository.save(payment);
		}

		booking.setStatus(status);
		LaundryBooking saved = bookingRepository.save(booking);

		try {
			Long userId = saved.getStudent().getUser().getUserId();
			String title = "Laundry Status Updated";
			String message = "Your laundry booking #" + saved.getBookingId() + " is now " + status;
			if ("WASHED".equalsIgnoreCase(status)) {
				message += ". ₹" + saved.getAmount() + " has been deducted from your wallet.";
			}

			NotificationDTO notif = new NotificationDTO(null, userId, title, message, false, null);
			notificationService.send(notif);
		} catch (Exception e) {
			log.error("Failed to send laundry notification: {}", e.getMessage());
		}

		return new LaundryBookingDTO(saved.getBookingId(), saved.getStudent().getStudentId(), saved.getClothesCount(),
				saved.getAmount(), saved.getStatus());
	}

	@Override
	public List<LaundryBookingDTO> getAllBookings(String username) {

		List<StaffBuildingMap> maps = staffBuildingMapRepo.findByStaff_User_Username(username);

		List<LaundryBooking> bookings;

		if (maps.isEmpty()) {
			User user = userRepository.findByUsername(username).orElse(null);
			if (user != null && user.getRole().getRoleName().equals("ADMIN")) {
				bookings = bookingRepository.findAll();
			} else {
				bookings = new ArrayList<>();
			}
		} else {
			com.smart.hostel.entity.HostelBuilding building = maps.get(0).getBuilding();
			bookings = bookingRepository.findByBuilding(building);
		}

		return bookings.stream().map(l -> {
			return new LaundryBookingDTO(l.getBookingId(), l.getStudent().getStudentId(), l.getClothesCount(),
					l.getAmount(), l.getStatus());
		}).toList();
	}
}
