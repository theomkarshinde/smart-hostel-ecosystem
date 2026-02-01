package com.smart.hostel.service.attendance;

import org.springframework.stereotype.Component;

import com.smart.hostel.dto.StudentAttendanceDTO;
import com.smart.hostel.entity.AttendanceType;
import com.smart.hostel.entity.HostelAction;
import com.smart.hostel.entity.Student;
import com.smart.hostel.repository.StudentAttendanceRepository;
import com.smart.hostel.service.StudentAttendanceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class HostelAttendanceStrategy implements AttendanceStrategy {

	private final StudentAttendanceService studentAttendanceService;
	private final StudentAttendanceRepository studentAttendanceRepository;

	@Override
	public boolean supports(AttendanceType type) {
		return type == AttendanceType.HOSTEL;
	}

	@Override
	public StudentAttendanceDTO mark(Student student, AttendanceType type) {
		log.info("Marking Hostel attendance for student: {}", student.getStudentId());

		HostelAction nextAction = HostelAction.IN;

		var lastAttendance = studentAttendanceRepository
				.findFirstByStudent_StudentIdAndAttendanceTypeOrderByAttendanceDateDescAttendanceTimeDesc(
						student.getStudentId(), AttendanceType.HOSTEL);

		if (lastAttendance.isPresent()) {
			HostelAction lastAction = lastAttendance.get().getHostelAction();
			nextAction = (lastAction == HostelAction.IN) ? HostelAction.OUT : HostelAction.IN;
			log.info("Last action was {}, next action will be {}", lastAction, nextAction);
		} else {
			log.info("No previous hostel attendance found, defaulting to IN");
		}

		StudentAttendanceDTO dto = new StudentAttendanceDTO(null, student.getStudentId(),
				student.getBuilding() != null ? student.getBuilding().getBuildingId() : null, type, nextAction, null,
				null, null, null);
		return studentAttendanceService.mark(dto);
	}
}
