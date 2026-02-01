package com.smart.hostel.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Staff {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "staff_id")
	private Long staffId;

	@OneToOne
	@JoinColumn(name = "user_id", unique = true)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "staff_type", nullable = false)
	private StaffType staffType;

	@Column(name = "full_name", nullable = false)
	private String fullName;

	@Column(name = "manages_mess", nullable = false)
	private Boolean managesMess = false;
}
