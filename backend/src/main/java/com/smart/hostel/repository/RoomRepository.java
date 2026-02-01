package com.smart.hostel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smart.hostel.entity.HostelBuilding;
import com.smart.hostel.entity.Room;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

	List<Room> findByBuilding(HostelBuilding building);
}
