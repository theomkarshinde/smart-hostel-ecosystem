package com.smart.hostel.dto;

import java.time.LocalDateTime;

public record AuditLogDTO(Long logId, Long userId, String action, LocalDateTime timestamp, String ipAddress) {
}
