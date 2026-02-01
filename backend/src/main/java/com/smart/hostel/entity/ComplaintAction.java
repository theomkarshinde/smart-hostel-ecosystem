package com.smart.hostel.entity;

import java.time.LocalDateTime;

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
@Table(name = "complaint_actions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintAction {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "action_id")
	private Long actionId;

	@ManyToOne
	@JoinColumn(name = "complaint_id")
	private Complaint complaint;

	@ManyToOne
	@JoinColumn(name = "staff_id")
	private Staff staff;

	@Column(name = "action_taken")
	private String actionTaken;

	@Column(name = "action_time")
	private LocalDateTime actionTime;
}
