package com.smart.hostel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smart.hostel.entity.HostelBuilding;
import com.smart.hostel.entity.Staff;
import com.smart.hostel.entity.StaffBuildingMap;

@Repository
public interface StaffBuildingMapRepository extends JpaRepository<StaffBuildingMap, Long> {

	List<StaffBuildingMap> findByStaff(Staff staff);

	List<StaffBuildingMap> findByStaff_User_Username(String username);

	List<StaffBuildingMap> findByBuilding(HostelBuilding building);

	boolean existsByStaffAndBuilding(Staff staff, HostelBuilding building);

	void deleteByStaff(Staff staff);
}
