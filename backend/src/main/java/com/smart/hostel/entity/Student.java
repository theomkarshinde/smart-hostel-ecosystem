package com.smart.hostel.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "student_id")
	private Long studentId;

	@OneToOne
	@JoinColumn(name = "user_id", unique = true)
	private User user;

	@Column(name = "full_name")
	private String fullName;

	@Enumerated(EnumType.STRING)
	@Column(name = "gender")
	private Gender gender;

	@Enumerated(EnumType.STRING)
	@Column(name = "status")
	private StudentStatus status = StudentStatus.PENDING;

	@ManyToOne
	@JoinColumn(name = "building_id")
	private HostelBuilding building;

	@Column(name = "wallet_balance", nullable = false)
	private Double walletBalance = 0.0;

	@Column(name = "total_fee")
	private Double totalFee = 0.0;

	@Column(name = "paid_fee")
	private Double paidFee = 0.0;

	@Column(name = "is_emi_enabled", columnDefinition = "TINYINT")
	private Boolean isEmiEnabled = false;

	@Column(name = "emi_amount")
	private Double emiAmount = 0.0;

	@Column(name = "room_number")
	private String roomNumber;

	@Column(name = "payment_method_selected", columnDefinition = "TINYINT")
	private Boolean paymentMethodSelected = false;
}
