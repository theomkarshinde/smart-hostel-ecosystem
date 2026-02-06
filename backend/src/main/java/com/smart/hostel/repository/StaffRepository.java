package com.smart.hostel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.smart.hostel.entity.Staff;
import com.smart.hostel.entity.StaffType;
import com.smart.hostel.entity.User;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {

	List<Staff> findByStaffType(StaffType staffType);

	Optional<Staff> findByUser(User user);

	@Query("SELECT s FROM Staff s WHERE s.staffType = StaffType.WARDEN AND NOT EXISTS (SELECT m FROM StaffBuildingMap m WHERE m.staff = s)")
	List<Staff> findUnassignedWardens();
}
