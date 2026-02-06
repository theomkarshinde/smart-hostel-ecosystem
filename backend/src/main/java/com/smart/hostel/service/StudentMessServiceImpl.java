package com.smart.hostel.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.NotificationDTO;
import com.smart.hostel.dto.StudentMessDTO;
import com.smart.hostel.entity.MessPlan;
import com.smart.hostel.entity.Payment;
import com.smart.hostel.entity.PaymentType;
import com.smart.hostel.entity.Student;
import com.smart.hostel.entity.StudentMess;
import com.smart.hostel.entity.User;
import com.smart.hostel.exception.InsufficientBalanceException;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.repository.MessPlanRepository;
import com.smart.hostel.repository.PaymentRepository;
import com.smart.hostel.repository.StudentMessRepository;
import com.smart.hostel.repository.StudentRepository;
import com.smart.hostel.repository.UserRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class StudentMessServiceImpl implements StudentMessService {

	private final StudentMessRepository studentMessRepository;
	private final StudentRepository studentRepository;
	private final MessPlanRepository messPlanRepository;
	private final UserRepository userRepository;
	private final PaymentRepository paymentRepository;
	private final NotificationService notificationService;

	@Override
	public StudentMessDTO subscribe(StudentMessDTO dto) {

		Student student = studentRepository.findById(dto.studentId())
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));
		MessPlan plan = messPlanRepository.findById(dto.planId())
				.orElseThrow(() -> new ResourceNotFoundException("Mess Plan not found"));

		LocalDate start = dto.startDate() != null ? dto.startDate() : LocalDate.now();
		LocalDate end = dto.endDate() != null ? dto.endDate() : start.plusDays(45);

		int totalMeals = 30 * 3;
		double totalCost = totalMeals * plan.getPerMealCost().doubleValue();

		if (student.getWalletBalance() < totalCost) {
			throw new InsufficientBalanceException("Insufficient wallet balance. Required: ₹" + totalCost
					+ ", Available: ₹" + student.getWalletBalance());
		}

		student.setWalletBalance(student.getWalletBalance() - totalCost);
		studentRepository.save(student);

		StudentMess sm = new StudentMess();
		sm.setStudent(student);
		sm.setMessPlan(plan);
		sm.setStartDate(start);
		sm.setEndDate(end);
		sm.setRemainingMeals(totalMeals);
		StudentMess saved = studentMessRepository.save(sm);

		Payment payment = new Payment();
		payment.setStudent(student);
		payment.setAmount(BigDecimal.valueOf(totalCost).negate());
		payment.setPaymentType(PaymentType.MESS);
		payment.setPaymentDate(LocalDateTime.now());
		paymentRepository.save(payment);

		try {
			NotificationDTO notif = new NotificationDTO(null, student.getUser().getUserId(), "Mess Plan Subscribed",
					"Subscribed to " + plan.getPlanName() + ". ₹" + totalCost + " deducted. You have " + totalMeals
							+ " meals.",
					false, null);
			notificationService.send(notif);
		} catch (Exception e) {
			log.error("Failed to send notification: {}", e.getMessage());
		}

		return new StudentMessDTO(saved.getId(), saved.getStudent().getStudentId(), saved.getMessPlan().getPlanId(),
				saved.getStartDate(), saved.getEndDate(), saved.getRemainingMeals());

	}

	@Override
	public StudentMessDTO getSubscription(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		Student student = studentRepository.findByUser(user)
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));

		List<StudentMess> list = studentMessRepository.findByStudent(student);
		if (list.isEmpty()) {
			return null;
		}
		StudentMess sm = list.get(list.size() - 1);

		return new StudentMessDTO(sm.getId(), sm.getStudent().getStudentId(), sm.getMessPlan().getPlanId(),
				sm.getStartDate(), sm.getEndDate(), sm.getRemainingMeals());
	}
}
