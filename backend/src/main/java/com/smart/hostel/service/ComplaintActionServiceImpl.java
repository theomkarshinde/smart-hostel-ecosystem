package com.smart.hostel.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.ComplaintActionDTO;
import com.smart.hostel.dto.NotificationDTO;
import com.smart.hostel.entity.Complaint;
import com.smart.hostel.entity.ComplaintAction;
import com.smart.hostel.entity.Staff;
import com.smart.hostel.exception.ResourceNotFoundException;
import com.smart.hostel.repository.ComplaintActionRepository;
import com.smart.hostel.repository.ComplaintRepository;
import com.smart.hostel.repository.StaffRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class ComplaintActionServiceImpl implements ComplaintActionService {

	private final ComplaintActionRepository actionRepository;
	private final ComplaintRepository complaintRepository;
	private final StaffRepository staffRepository;
	private final NotificationService notificationService;

	@Override
	public ComplaintActionDTO takeAction(ComplaintActionDTO dto) {
		Complaint complaint = complaintRepository.findById(dto.complaintId())
				.orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
		Staff staff = staffRepository.findById(dto.staffId())
				.orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

		ComplaintAction action = new ComplaintAction();
		action.setComplaint(complaint);
		action.setStaff(staff);
		action.setActionTaken(dto.actionTaken());
		action.setActionTime(LocalDateTime.now());

		ComplaintAction saved = actionRepository.save(action);

		if (complaint.getStudent() != null && complaint.getStudent().getUser() != null) {
			try {
				notificationService.send(new NotificationDTO(null, complaint.getStudent().getUser().getUserId(),
						"Action Taken on Complaint", "Staff " + staff.getFullName()
								+ " has been assigned/taken action on your complaint: " + dto.actionTaken(),
						false, null));
			} catch (Exception e) {
				log.error("Failed to send complaint action notification: {}", e.getMessage());
			}
		}

		return new ComplaintActionDTO(saved.getActionId(), saved.getComplaint().getComplaintId(),
				saved.getStaff().getStaffId(), saved.getActionTaken(), saved.getActionTime());
	}

	@Override
	public List<ComplaintActionDTO> getByComplaint(Long complaintId) {
		Complaint complaint = complaintRepository.findById(complaintId)
				.orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
		List<ComplaintActionDTO> list = new ArrayList<>();

		for (ComplaintAction action : actionRepository.findByComplaintOrderByActionTimeAsc(complaint)) {
			list.add(new ComplaintActionDTO(action.getActionId(), action.getComplaint().getComplaintId(),
					action.getStaff().getStaffId(), action.getActionTaken(), action.getActionTime()));
		}
		return list;
	}
}
