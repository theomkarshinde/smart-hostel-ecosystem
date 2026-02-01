package com.smart.hostel.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mess_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessPlan {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "plan_id")
	private Integer planId;

	@Column(name = "plan_name")
	private String planName;

	@Column(name = "per_meal_cost")
	private BigDecimal perMealCost;
}
