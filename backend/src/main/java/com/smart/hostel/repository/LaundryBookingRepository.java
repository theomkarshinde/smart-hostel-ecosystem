package com.smart.hostel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smart.hostel.entity.HostelBuilding;
import com.smart.hostel.entity.LaundryBooking;
import com.smart.hostel.entity.Student;

@Repository
public interface LaundryBookingRepository extends JpaRepository<LaundryBooking, Long> {

	List<LaundryBooking> findByStudent(Student student);

	List<LaundryBooking> findByBuilding(HostelBuilding building);
}
