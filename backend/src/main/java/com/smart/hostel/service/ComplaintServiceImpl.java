package com.smart.hostel.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.ComplaintDTO;
import com.smart.hostel.dto.NotificationDTO;
import com.smart.hostel.entity.Complaint;
import com.smart.hostel.entity.ComplaintCategory;
import com.smart.hostel.entity.ComplaintStatus;
import com.smart.hostel.entity.HostelBuilding;
import com.smart.hostel.entity.Student;
import com.smart.hostel.entity.User;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.repository.ComplaintRepository;
import com.smart.hostel.repository.HostelBuildingRepository;
import com.smart.hostel.repository.StudentRepository;
import com.smart.hostel.repository.UserRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class ComplaintServiceImpl implements ComplaintService {

	private final ComplaintRepository complaintRepository;
	private final StudentRepository studentRepository;
	private final HostelBuildingRepository buildingRepository;
	private final UserRepository userRepository;
	private final NotificationService notificationService;

	@Override
	public ComplaintDTO raise(ComplaintDTO dto, String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		Student student = studentRepository.findByUser(user).orElseThrow(
				() -> new ResourceNotFoundException("Student profile not found. Please complete your registration."));

		validateStudentBuilding(student);
		Complaint complaint = createComplaintEntity(student, dto);
		Complaint saved = complaintRepository.save(complaint);

		return mapToDTO(saved);
	}

	private void validateStudentBuilding(Student student) {
		if (student.getBuilding() == null) {
			throw new ResourceNotFoundException("Student is not assigned to any hostel building.");
		}
	}

	private Complaint createComplaintEntity(Student student, ComplaintDTO dto) {
		Complaint c = new Complaint();
		c.setStudent(student);
		c.setBuilding(student.getBuilding());
		c.setCategory(dto.category());
		c.setDescription(dto.description());
		c.setStatus(ComplaintStatus.OPEN);
		c.setCreatedAt(LocalDateTime.now());
		c.setUpdatedAt(LocalDateTime.now());
		return c;
	}

	@Override
	public List<ComplaintDTO> getByStudent(Long studentId) {
		Student student = studentRepository.findById(studentId)
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));
		List<ComplaintDTO> list = new ArrayList<>();

		for (Complaint c : complaintRepository.findByStudentOrderByCreatedAtDesc(student)) {
			list.add(new ComplaintDTO(c.getComplaintId(), c.getStudent().getStudentId(),
					c.getBuilding().getBuildingId(), c.getCategory(), c.getDescription(), c.getResolutionComment(),
					c.getStatus(), c.getCreatedAt(), c.getUpdatedAt(), c.getStudent().getFullName(),
					c.getStudent().getRoomNumber()));
		}
		log.debug("Found {} complaints for studentId: {}", list.size(), studentId);
		return list;
	}

	@Override
	public List<ComplaintDTO> getByBuilding(Long buildingId, ComplaintStatus status) {
		HostelBuilding building = buildingRepository.findById(buildingId).orElse(null);
		List<ComplaintDTO> list = new ArrayList<>();

		if (building != null) {
			for (Complaint c : complaintRepository.findByBuildingAndStatusOrderByCreatedAtDesc(building, status)) {
				list.add(new ComplaintDTO(c.getComplaintId(), c.getStudent().getStudentId(),
						c.getBuilding().getBuildingId(), c.getCategory(), c.getDescription(), c.getResolutionComment(),
						c.getStatus(), c.getCreatedAt(), c.getUpdatedAt(), c.getStudent().getFullName(),
						c.getStudent().getRoomNumber()));
			}
		}
		log.debug("Found {} complaints for buildingId: {}", list.size(), buildingId);
		return list;
	}

	@Override
	public List<ComplaintDTO> getAllByBuilding(Long buildingId) {
		HostelBuilding building = buildingRepository.findById(buildingId).orElse(null);
		log.debug("getAllByBuilding called for buildingId: {}", buildingId);
		if (building == null) {
			log.debug("Building not found for ID: {}", buildingId);
		}
		List<ComplaintDTO> list = new ArrayList<>();

		if (building != null) {
			for (Complaint c : complaintRepository.findByBuildingOrderByCreatedAtDesc(building)) {
				list.add(new ComplaintDTO(c.getComplaintId(), c.getStudent().getStudentId(),
						c.getBuilding().getBuildingId(), c.getCategory(), c.getDescription(), c.getResolutionComment(),
						c.getStatus(), c.getCreatedAt(), c.getUpdatedAt(), c.getStudent().getFullName(),
						c.getStudent().getRoomNumber()));
			}
		}
		log.debug("Found {} complaints for buildingId: {}", list.size(), buildingId);

		List<Complaint> all = complaintRepository.findAll();
		log.debug("Total complaints in entire DB: {}", all.size());
		for (Complaint c : all) {
			log.debug("Complaint {} | Building: {} | Status: {}", c.getComplaintId(),
					(c.getBuilding() != null ? c.getBuilding().getBuildingId() : "NULL"), c.getStatus());
		}

		return list;
	}

	@Override
	public ComplaintDTO updateStatus(Long complaintId, ComplaintStatus status, String resolutionComment) {
		Complaint complaint = complaintRepository.findById(complaintId)
				.orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

		complaint.setStatus(status);
		if (resolutionComment != null && !resolutionComment.isEmpty()) {
			complaint.setResolutionComment(resolutionComment);
		}
		complaint.setUpdatedAt(LocalDateTime.now());
		Complaint saved = complaintRepository.save(complaint);

		sendComplaintUpdateNotification(saved);

		return mapToDTO(saved);
	}

	private void sendComplaintUpdateNotification(Complaint complaint) {
		if (complaint.getStudent() != null && complaint.getStudent().getUser() != null) {
			try {
				notificationService.send(new NotificationDTO(null, complaint.getStudent().getUser().getUserId(),
						"Complaint Status Updated",
						"Your complaint #" + complaint.getComplaintId() + " is now " + complaint.getStatus(), false,
						null));
			} catch (Exception e) {
				log.error("Failed to send complaint notification for complaint {}: {}", complaint.getComplaintId(),
						e.getMessage());
			}
		}
	}

	private ComplaintDTO mapToDTO(Complaint complaint) {
		return new ComplaintDTO(complaint.getComplaintId(), complaint.getStudent().getStudentId(),
				complaint.getBuilding().getBuildingId(), complaint.getCategory(), complaint.getDescription(),
				complaint.getResolutionComment(), complaint.getStatus(), complaint.getCreatedAt(),
				complaint.getUpdatedAt(), complaint.getStudent().getFullName(), complaint.getStudent().getRoomNumber());
	}

	@Override
	public List<ComplaintDTO> getMessComplaints() {
		List<ComplaintDTO> list = new ArrayList<>();
		for (Complaint c : complaintRepository.findByCategoryOrderByCreatedAtDesc(ComplaintCategory.MESS)) {
			list.add(new ComplaintDTO(c.getComplaintId(), c.getStudent().getStudentId(),
					c.getBuilding().getBuildingId(), c.getCategory(), c.getDescription(), c.getResolutionComment(),
					c.getStatus(), c.getCreatedAt(), c.getUpdatedAt(), c.getStudent().getFullName(),
					c.getStudent().getRoomNumber()));
		}
		log.debug("Found {} Mess complaints", list.size());
		return list;
	}
}
