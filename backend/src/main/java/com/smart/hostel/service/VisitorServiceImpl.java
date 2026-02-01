package com.smart.hostel.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.NotificationDTO;
import com.smart.hostel.dto.VisitorDTO;
import com.smart.hostel.entity.Student;
import com.smart.hostel.entity.Visitor;
import com.smart.hostel.entity.VisitorStatus;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.repository.StudentRepository;
import com.smart.hostel.repository.VisitorRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class VisitorServiceImpl implements VisitorService {

	private final VisitorRepository visitorRepository;
	private final StudentRepository studentRepository;
	private final NotificationService notificationService;

	@Override
	public VisitorDTO log(VisitorDTO dto) {

		Student student = studentRepository.findById(dto.studentId())
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));

		Visitor v = new Visitor();
		v.setStudent(student);
		v.setVisitorName(dto.visitorName());
		v.setContactNumber(dto.contactNumber());
		v.setPurpose(dto.purpose());
		v.setVisitDate(dto.visitDate() != null ? dto.visitDate() : LocalDateTime.now());
		v.setStatus(dto.status() != null ? dto.status() : VisitorStatus.CHECKED_IN);

		if (v.getStatus() == VisitorStatus.CHECKED_IN) {
			v.setInTime(LocalDateTime.now());
		}

		if (dto.outTime() != null) {
			v.setOutTime(dto.outTime());
		}

		Visitor saved = visitorRepository.save(v);

		return mapToDTO(saved);
	}

	@Override
	public List<VisitorDTO> getByStudent(Long studentId) {
		Student student = studentRepository.findById(studentId)
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));
		List<VisitorDTO> list = new ArrayList<>();

		for (Visitor v : visitorRepository.findByStudent(student)) {
			list.add(mapToDTO(v));
		}
		return list;
	}

	@Override
	public List<VisitorDTO> getRecent() {
		List<VisitorDTO> list = new ArrayList<>();
		for (Visitor v : visitorRepository.findAll()) {
			list.add(mapToDTO(v));
		}
		return list;
	}

	@Override
	public VisitorDTO createRequest(VisitorDTO dto) {
		Student student = studentRepository.findById(dto.studentId())
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));

		Visitor v = new Visitor();
		v.setStudent(student);
		v.setVisitorName(dto.visitorName());
		v.setContactNumber(dto.contactNumber());
		v.setPurpose(dto.purpose());
		v.setVisitDate(dto.visitDate() != null ? dto.visitDate() : LocalDateTime.now());
		v.setStatus(VisitorStatus.PENDING);

		Visitor saved = visitorRepository.save(v);
		return mapToDTO(saved);
	}

	@Override
	public VisitorDTO updateStatus(Long visitorId, VisitorStatus status) {
		Visitor v = visitorRepository.findById(visitorId)
				.orElseThrow(() -> new ResourceNotFoundException("Visitor request not found"));

		v.setStatus(status);
		if (status == VisitorStatus.CHECKED_IN) {
			v.setInTime(LocalDateTime.now());
		} else if (status == VisitorStatus.CHECKED_OUT) {
			v.setOutTime(LocalDateTime.now());
		}

		Visitor saved = visitorRepository.save(v);

		// Notify Student
		if (saved.getStudent() != null && saved.getStudent().getUser() != null) {
			try {
				notificationService.send(
						new NotificationDTO(null, saved.getStudent().getUser().getUserId(), "Visitor Status Updated",
								"Visitor " + saved.getVisitorName() + " is now " + saved.getStatus(), false, null));
			} catch (Exception e) {
				log.error("Failed to send visitor notification: {}", e.getMessage());
			}
		}
		return mapToDTO(saved);
	}

	@Override
	public List<VisitorDTO> getPendingRequestsByBuilding(Long buildingId) {
		List<VisitorDTO> list = new ArrayList<>();
		List<Visitor> visitors = visitorRepository.findByStudent_Building_BuildingIdAndStatus(buildingId,
				VisitorStatus.PENDING);

		for (Visitor v : visitors) {
			list.add(mapToDTO(v));
		}
		return list;
	}

	private VisitorDTO mapToDTO(Visitor v) {
		return new VisitorDTO(v.getVisitorId(), v.getStudent().getStudentId(), v.getStudent().getFullName(),
				v.getVisitorName(), v.getContactNumber(), v.getPurpose(), v.getStatus(), v.getVisitDate(),
				v.getInTime(), v.getOutTime());
	}

}
