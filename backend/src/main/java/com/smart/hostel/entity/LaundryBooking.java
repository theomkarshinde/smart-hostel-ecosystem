package com.smart.hostel.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "laundry_booking")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LaundryBooking {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "booking_id")
	private Long bookingId;

	@ManyToOne
	@JoinColumn(name = "student_id")
	private Student student;

	@Column(name = "clothes_count")
	private Integer clothesCount;

	@Column(name = "amount")
	private BigDecimal amount;

	@Column(name = "status")
	private String status;

	@ManyToOne
	@JoinColumn(name = "building_id")
	private HostelBuilding building;
}
