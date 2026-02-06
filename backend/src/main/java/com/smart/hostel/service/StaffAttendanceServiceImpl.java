package com.smart.hostel.service;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.StaffAttendanceDTO;
import com.smart.hostel.entity.HostelBuilding;
import com.smart.hostel.entity.Staff;
import com.smart.hostel.entity.StaffAttendance;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.repository.HostelBuildingRepository;
import com.smart.hostel.repository.StaffAttendanceRepository;
import com.smart.hostel.repository.StaffRepository;
import java.util.List;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class StaffAttendanceServiceImpl implements StaffAttendanceService {

	private final StaffAttendanceRepository attendanceRepository;
	private final StaffRepository staffRepository;
	private final HostelBuildingRepository buildingRepository;

	@Override
	public StaffAttendanceDTO mark(StaffAttendanceDTO dto) {

		Staff staff = staffRepository.findById(dto.staffId())
				.orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

		HostelBuilding building = null;
		if (dto.buildingId() != null) {
			building = buildingRepository.findById(dto.buildingId()).orElse(null);
		}

		LocalDate today = LocalDate.now();
		List<StaffAttendance> existing = attendanceRepository.findByStaffAndAttendanceDate(staff, today);
		for (StaffAttendance ea : existing) {
			if (ea.getAction() == dto.action()) {
				throw new RuntimeException(
						"Attendance already marked as " + dto.action() + " for today");
			}
		}

		StaffAttendance a = new StaffAttendance();
		a.setStaff(staff);
		a.setBuilding(building);
		a.setAttendanceDate(LocalDate.now());
		a.setAttendanceTime(LocalTime.now());
		a.setAction(dto.action());

		StaffAttendance saved = attendanceRepository.save(a);

		return new StaffAttendanceDTO(saved.getStaffAttendanceId(), saved.getStaff().getStaffId(),
				saved.getBuilding() != null ? saved.getBuilding().getBuildingId() : null, saved.getAction(),
				saved.getAttendanceDate(), saved.getAttendanceTime(), saved.getCreatedAt());
	}
}
