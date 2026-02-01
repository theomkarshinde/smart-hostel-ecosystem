package com.smart.hostel.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.GuardDashboardStatsDTO;
import com.smart.hostel.dto.VisitorDTO;
import com.smart.hostel.entity.VisitorStatus;
import com.smart.hostel.repository.VisitorRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class GuardServiceImpl implements GuardService {

	private final VisitorService visitorService;
	private final VisitorRepository visitorRepository;

	@Override
	public VisitorDTO verifyAndLogVisitor(VisitorDTO dto) {
		return visitorService.log(dto);
	}

	@Override
	public List<VisitorDTO> getRecentVisitors() {
		return visitorService.getRecent();
	}

	@Override
	public GuardDashboardStatsDTO getDashboardStats() {
		long activeVisitors = visitorRepository.countByStatus(VisitorStatus.CHECKED_IN);

		LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
		LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);
		long todayVisitors = visitorRepository.countByVisitDateBetween(startOfDay, endOfDay);

		return new GuardDashboardStatsDTO(activeVisitors, todayVisitors);
	}
}
