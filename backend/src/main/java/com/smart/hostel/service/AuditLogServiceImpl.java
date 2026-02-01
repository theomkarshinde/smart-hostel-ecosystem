package com.smart.hostel.service;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.AuditLogDTO;
import com.smart.hostel.entity.AuditLog;
import com.smart.hostel.repository.AuditLogRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

	private final AuditLogRepository auditLogRepository;

	@Override
	public AuditLogDTO log(AuditLogDTO dto) {

		AuditLog log = new AuditLog();
		log.setAction(dto.action());
		log.setIpAddress(dto.ipAddress());
		log.setTimestamp(dto.timestamp());

		AuditLog saved = auditLogRepository.save(log);
		return new AuditLogDTO(saved.getLogId(), saved.getUser() != null ? saved.getUser().getUserId() : null,
				saved.getAction(), saved.getTimestamp(), saved.getIpAddress());
	}
}
