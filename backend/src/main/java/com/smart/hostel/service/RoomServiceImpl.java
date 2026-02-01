package com.smart.hostel.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.RoomDTO;
import com.smart.hostel.entity.Room;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.repository.HostelBuildingRepository;
import com.smart.hostel.repository.RoomRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RoomServiceImpl implements RoomService {

	private final RoomRepository roomRepository;
	private final HostelBuildingRepository buildingRepository;

	@Override
	public RoomDTO create(RoomDTO dto) {
		Room room = new Room();
		room.setRoomNumber(dto.roomNumber());
		room.setBuilding(buildingRepository.findById(dto.buildingId())
				.orElseThrow(() -> new ResourceNotFoundException("Building not found")));

		Room saved = roomRepository.save(room);

		return new RoomDTO(saved.getRoomId(), saved.getRoomNumber(), saved.getBuilding().getBuildingId());
	}

	@Override
	public RoomDTO getById(Long roomId) {
		Room room = roomRepository.findById(roomId).orElse(null);
		if (room == null)
			return null;

		return new RoomDTO(room.getRoomId(), room.getRoomNumber(), room.getBuilding().getBuildingId());
	}

	@Override
	public List<RoomDTO> getRoomsByBuilding(Long buildingId) {
		var b = buildingRepository.findById(buildingId)
				.orElseThrow(() -> new ResourceNotFoundException("Building not found"));
		List<Room> rooms = roomRepository.findByBuilding(b);
		List<RoomDTO> dtos = new ArrayList<>();
		for (Room r : rooms) {
			dtos.add(new RoomDTO(r.getRoomId(), r.getRoomNumber(), r.getBuilding().getBuildingId()));
		}
		return dtos;
	}
}
