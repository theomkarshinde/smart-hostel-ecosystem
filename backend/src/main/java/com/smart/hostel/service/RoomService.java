package com.smart.hostel.service;

import java.util.List;

import com.smart.hostel.dto.RoomDTO;

public interface RoomService {
	RoomDTO create(RoomDTO dto);

	RoomDTO getById(Long roomId);

	List<RoomDTO> getRoomsByBuilding(Long buildingId);
}
