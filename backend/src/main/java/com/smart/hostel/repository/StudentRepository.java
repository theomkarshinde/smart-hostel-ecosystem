package com.smart.hostel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smart.hostel.entity.HostelBuilding;
import com.smart.hostel.entity.Student;
import com.smart.hostel.entity.StudentStatus;
import com.smart.hostel.entity.User;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

	List<Student> findByStatus(StudentStatus status);

	long countByStatus(StudentStatus status);

	List<Student> findByBuilding(HostelBuilding building);

	Optional<Student> findByUser(User user);

	List<Student> findByFullNameContainingIgnoreCase(String name);

	@Query("SELECT s FROM Student s JOIN FETCH s.user WHERE LOWER(s.fullName) LIKE LOWER(CONCAT('%', :query, '%'))")
	List<Student> searchStudentsWithUser(@Param("query") String query);

	@Query("SELECT DISTINCT s.roomNumber FROM Student s JOIN s.building b WHERE b.buildingId = :buildingId AND s.roomNumber IS NOT NULL AND s.status = StudentStatus.APPROVED")
	List<String> findAllocatedRoomNumbersByBuildingId(@Param("buildingId") Long buildingId);
}
