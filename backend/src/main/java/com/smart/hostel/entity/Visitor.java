package com.smart.hostel.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "visitors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Visitor {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "visitor_id")
	private Long visitorId;

	@ManyToOne
	@JoinColumn(name = "student_id")
	private Student student;

	@Column(name = "visitor_name")
	private String visitorName;

	@Column(name = "in_time")
	private LocalDateTime inTime;

	@Column(name = "out_time")
	private LocalDateTime outTime;

	@Column(name = "contact_number")
	private String contactNumber;

	@Column(name = "purpose")
	private String purpose;

	@Enumerated(EnumType.STRING)
	@Column(name = "status")
	private VisitorStatus status;

	@Column(name = "visit_date")
	private LocalDateTime visitDate;
}
