package com.smart.hostel.service.attendance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Component;

import com.smart.hostel.dto.NotificationDTO;
import com.smart.hostel.dto.StudentAttendanceDTO;
import com.smart.hostel.entity.AttendanceType;
import com.smart.hostel.entity.MealType;
import com.smart.hostel.entity.MessMenu;
import com.smart.hostel.entity.Payment;
import com.smart.hostel.entity.PaymentType;
import com.smart.hostel.entity.Student;
import com.smart.hostel.entity.StudentMess;
import com.smart.hostel.exception.InsufficientBalanceException;
import com.smart.hostel.exception.MenuNotAvailableException;
import com.smart.hostel.repository.MessMenuRepository;
import com.smart.hostel.repository.PaymentRepository;
import com.smart.hostel.repository.StudentAttendanceRepository;
import com.smart.hostel.repository.StudentMessRepository;
import com.smart.hostel.repository.StudentRepository;
import com.smart.hostel.service.NotificationService;
import com.smart.hostel.service.StudentAttendanceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class MessAttendanceStrategy implements AttendanceStrategy {

	private final StudentAttendanceService studentAttendanceService;
	private final StudentMessRepository studentMessRepository;
	private final MessMenuRepository messMenuRepository;
	private final PaymentRepository paymentRepository;
	private final StudentRepository studentRepository;
	private final NotificationService notificationService;
	private final StudentAttendanceRepository studentAttendanceRepository;

	@Override
	public boolean supports(AttendanceType type) {
		return type == AttendanceType.MESS;
	}

	@Override
	public StudentAttendanceDTO mark(Student student, AttendanceType type) {
		log.info("Marking Mess attendance for student: {}", student.getStudentId());

		MealType mealType = determineMealType();
		validateNoDuplicate(student, mealType);

		List<StudentMess> subs = studentMessRepository.findActiveSubscription(student, LocalDate.now());
		if (!subs.isEmpty()) {
			handleSubscriptionAttendance(student, subs.get(0), mealType);
		} else {
			handlePayPerMealAttendance(student, mealType);
		}

		StudentAttendanceDTO dto = new StudentAttendanceDTO(null, student.getStudentId(), null, type, null, mealType,
				null, null, null);
		return studentAttendanceService.mark(dto);
	}

	private MealType determineMealType() {
		LocalTime now = LocalTime.now();
		if (now.isAfter(LocalTime.of(7, 0)) && now.isBefore(LocalTime.of(11, 0))) {
			return MealType.BREAKFAST;
		} else if (now.isAfter(LocalTime.of(12, 0)) && now.isBefore(LocalTime.of(14, 0))) {
			return MealType.LUNCH;
		} else if (now.isAfter(LocalTime.of(19, 0)) && now.isBefore(LocalTime.of(22, 0))) {
			return MealType.DINNER;
		}
		throw new MenuNotAvailableException(
				"Mess is currently closed. Allowed timings: Breakfast (7-11), Lunch (12-2), Dinner (7-10)");
	}

	private void validateNoDuplicate(Student student, MealType mealType) {
		if (studentAttendanceRepository.existsByStudentAndAttendanceDateAndMealType(student, LocalDate.now(),
				mealType)) {
			throw new RuntimeException("Attendance already marked for " + mealType + " today");
		}
	}

	private void handleSubscriptionAttendance(Student student, StudentMess subscription, MealType mealType) {
		if (subscription.getRemainingMeals() == null || subscription.getRemainingMeals() <= 0) {
			throw new RuntimeException("No meals remaining in your subscription. Please renew your plan.");
		}

		subscription.setRemainingMeals(subscription.getRemainingMeals() - 1);
		studentMessRepository.save(subscription);

		sendNotification(student.getUser().getUserId(), "Meal Consumed",
				mealType + " attendance marked. Remaining meals: " + subscription.getRemainingMeals());
	}

	private void handlePayPerMealAttendance(Student student, MealType mealType) {
		List<MessMenu> menus = messMenuRepository.findByMenuDateAndMealType(LocalDate.now(), mealType);
		if (menus.isEmpty()) {
			throw new MenuNotAvailableException(
					"No menu set for today and no active subscription. Cannot mark attendance.");
		}

		MessMenu menu = menus.get(0);
		double price = menu.getPrice();

		if (student.getWalletBalance() < price) {
			throw new InsufficientBalanceException(
					"Insufficient wallet balance. Required: ₹" + price + ", Available: ₹" + student.getWalletBalance());
		}

		student.setWalletBalance(student.getWalletBalance() - price);
		studentRepository.save(student);

		Payment debit = new Payment();
		debit.setStudent(student);
		debit.setAmount(BigDecimal.valueOf(price).negate());
		debit.setPaymentType(PaymentType.MESS);
		debit.setPaymentDate(LocalDateTime.now());
		paymentRepository.save(debit);

		sendNotification(student.getUser().getUserId(), "Mess Wallet Debited",
				"₹" + price + " deducted for " + mealType + " attendance.");
	}

	private void sendNotification(Long userId, String title, String message) {
		try {
			notificationService.send(new NotificationDTO(null, userId, title, message, false, null));
		} catch (Exception e) {
			log.error("Failed to send notification to user {}: {}", userId, e.getMessage());
		}
	}
}
