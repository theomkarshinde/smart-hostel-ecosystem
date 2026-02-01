package com.smart.hostel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smart.hostel.entity.Payment;
import com.smart.hostel.entity.Student;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

	List<Payment> findByStudent(Student student);
}
