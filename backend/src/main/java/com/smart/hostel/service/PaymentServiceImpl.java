package com.smart.hostel.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.smart.hostel.dto.NotificationDTO;
import com.smart.hostel.dto.PaymentDTO;
import com.smart.hostel.entity.Payment;
import com.smart.hostel.entity.PaymentType;
import com.smart.hostel.entity.Student;
import com.smart.hostel.entity.User;
import com.smart.hostel.exception.InsufficientBalanceException;
import com.smart.hostel.exception.PaymentCreationException;
import com.smart.hostel.exception.PaymentVerificationException;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.repository.PaymentRepository;
import com.smart.hostel.repository.StudentRepository;
import com.smart.hostel.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;
    private final String razorpaySecret;

    public PaymentServiceImpl(RazorpayClient razorpayClient, PaymentRepository paymentRepository,
            UserRepository userRepository, StudentRepository studentRepository, NotificationService notificationService,
            @Value("${razorpay.key.secret}") String razorpaySecret) {
        this.razorpayClient = razorpayClient;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.notificationService = notificationService;
        this.razorpaySecret = razorpaySecret;
    }

    @Override
    public List<PaymentDTO> getHistory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<Payment> list = paymentRepository.findByStudent(student);

        return list.stream().map(p -> new PaymentDTO(p.getPaymentId(), p.getStudent().getStudentId(), p.getAmount(),
                p.getPaymentType(), p.getPaymentDate(), null, null, null)).collect(Collectors.toList());
    }

    @Override
    public String createRazorpayOrder(PaymentDTO dto) {

        try {
            JSONObject request = new JSONObject();
            request.put("amount", dto.amount().multiply(BigDecimal.valueOf(100)).intValue());
            request.put("currency", "INR");
            request.put("receipt", "hostel_rcpt_" + System.currentTimeMillis());

            Order order = razorpayClient.orders.create(request);
            return order.get("id");

        } catch (Exception e) {
            throw new PaymentCreationException("Failed to create Razorpay order", e);
        }
    }

    @Override
    public PaymentDTO confirmPayment(PaymentDTO dto) {

        boolean isValid = verifyPaymentSignature(dto.razorpayOrderId(), dto.razorpayPaymentId(),
                dto.razorpaySignature());
        if (!isValid) {
            throw new PaymentVerificationException("Payment signature verification failed");
        }

        Student student = studentRepository.findById(dto.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setAmount(dto.amount());
        payment.setPaymentType(dto.paymentType());
        payment.setPaymentDate(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);

        if (dto.paymentType() == PaymentType.HOSTEL || dto.paymentType() == null) {
            Double currentPaid = student.getPaidFee() != null ? student.getPaidFee() : 0.0;
            student.setPaidFee(currentPaid + dto.amount().doubleValue());
        } else if (dto.paymentType() == PaymentType.MESS) {
            // Mess payment logic can be added here if needed
        } else {
            Double currentBalance = student.getWalletBalance() != null ? student.getWalletBalance() : 0.0;
            student.setWalletBalance(currentBalance + dto.amount().doubleValue());
        }
        studentRepository.save(student);

        return new PaymentDTO(saved.getPaymentId(), saved.getStudent().getStudentId(), saved.getAmount(),
                saved.getPaymentType(), saved.getPaymentDate(), dto.razorpayOrderId(), dto.razorpayPaymentId(),
                dto.razorpaySignature());
    }

    @Override
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(options, razorpaySecret);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public PaymentDTO addCashPayment(PaymentDTO dto) {
        Student student = studentRepository.findById(dto.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setAmount(dto.amount());
        payment.setPaymentType(dto.paymentType());
        payment.setPaymentDate(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);

        if (dto.paymentType() == PaymentType.HOSTEL) {
            Double currentPaid = student.getPaidFee() != null ? student.getPaidFee() : 0.0;
            student.setPaidFee(currentPaid + dto.amount().doubleValue());
        } else if (dto.paymentType() == PaymentType.WALLET) {
            Double currentBalance = student.getWalletBalance() != null ? student.getWalletBalance() : 0.0;
            student.setWalletBalance(currentBalance + dto.amount().doubleValue());
        }
        studentRepository.save(student);

        try {
            NotificationDTO notif = new NotificationDTO(null, student.getUser().getUserId(), "Cash Payment Received",
                    "Cash Payment Received: ₹" + dto.amount() + " for " + dto.paymentType(), false, null);
            notificationService.send(notif);
        } catch (Exception e) {
            log.error("Failed to send payment notification: {}", e.getMessage());
        }

        return new PaymentDTO(saved.getPaymentId(), saved.getStudent().getStudentId(), saved.getAmount(),
                saved.getPaymentType(), saved.getPaymentDate(), null, null, null);
    }

    @Override
    public PaymentDTO payFeeFromWallet(Long studentId, BigDecimal amount) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        validateWalletBalance(student, amount);
        updateStudentWalletAndFee(student, amount);

        Payment saved = createPaymentRecord(student, amount, PaymentType.HOSTEL);
        createPaymentRecord(student, amount.negate(), PaymentType.WALLET);

        sendFeePaymentNotification(student, amount);

        return mapToPaymentDTO(saved, student);
    }

    private void validateWalletBalance(Student student, BigDecimal amount) {
        if (student.getWalletBalance() < amount.doubleValue()) {
            throw new InsufficientBalanceException(
                    "Insufficient wallet balance. Please add money to your wallet first.");
        }
    }

    private void updateStudentWalletAndFee(Student student, BigDecimal amount) {
        student.setWalletBalance(student.getWalletBalance() - amount.doubleValue());
        Double currentPaid = student.getPaidFee() != null ? student.getPaidFee() : 0.0;
        student.setPaidFee(currentPaid + amount.doubleValue());
        studentRepository.save(student);
    }

    private Payment createPaymentRecord(Student student, BigDecimal amount, PaymentType type) {
        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setAmount(amount);
        payment.setPaymentType(type);
        payment.setPaymentDate(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    private void sendFeePaymentNotification(Student student, BigDecimal amount) {
        try {
            NotificationDTO notif = new NotificationDTO(null, student.getUser().getUserId(), "Fee Payment Successful",
                    "A fee payment of ₹" + amount + " has been processed from your wallet.", false, null);
            notificationService.send(notif);
        } catch (Exception e) {
            log.error("Failed to send fee payment notification for student {}: {}", student.getStudentId(),
                    e.getMessage());
        }
    }

    private PaymentDTO mapToPaymentDTO(Payment saved, Student student) {
        return new PaymentDTO(saved.getPaymentId(), student.getStudentId(), saved.getAmount(), saved.getPaymentType(),
                saved.getPaymentDate(), null, null, null);
    }
}
