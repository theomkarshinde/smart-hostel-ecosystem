package com.smart.hostel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.smart.hostel.entity.HostelBuilding;

@Repository
public interface HostelBuildingRepository extends JpaRepository<HostelBuilding, Long> {
	@Query("SELECT b FROM HostelBuilding b WHERE NOT EXISTS (SELECT m FROM StaffBuildingMap m WHERE m.building = b)")
	List<HostelBuilding> findUnassignedBuildings();
}
