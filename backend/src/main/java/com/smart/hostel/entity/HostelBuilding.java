package com.smart.hostel.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hostel_buildings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HostelBuilding {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "building_id")
	private Long buildingId;

	@Column(name = "building_name", unique = true, nullable = false)
	private String buildingName;

	@Enumerated(EnumType.STRING)
	@Column(name = "building_type", nullable = false)
	private BuildingType buildingType;

	private Integer totalRooms;
	private Integer totalCapacity;
	private Integer availableRooms;

	@Column(name = "fee")
	private Double fee;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@OneToMany(mappedBy = "building")
	private List<Student> students;

}
