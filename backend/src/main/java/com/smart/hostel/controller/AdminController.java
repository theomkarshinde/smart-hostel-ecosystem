package com.smart.hostel.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smart.hostel.dto.AdminDashboardStatsDTO;
import com.smart.hostel.dto.HostelBuildingDTO;
import com.smart.hostel.dto.RegistrationRequest;
import com.smart.hostel.dto.StaffBuildingMapDTO;
import com.smart.hostel.dto.StaffDTO;
import com.smart.hostel.dto.UserDTO;
import com.smart.hostel.service.AdminService;
import com.smart.hostel.service.HostelBuildingService;
import com.smart.hostel.service.QRCodeService;
import com.smart.hostel.service.StaffBuildingMapService;
import com.smart.hostel.service.StaffService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/admin")
@AllArgsConstructor
public class AdminController extends BaseApiController {

	private final StaffBuildingMapService staffBuildingMapService;
	private final AdminService adminService;
	private final QRCodeService qrCodeService;
	private final StaffService staffService;
	private final HostelBuildingService buildingService;

	@GetMapping("/wardens/unassigned")
	public ResponseEntity<List<StaffDTO>> getUnassignedWardens() {
		return ResponseEntity.ok(staffService.getUnassignedWardens());
	}

	@GetMapping("/buildings/unassigned")
	public ResponseEntity<List<HostelBuildingDTO>> getUnassignedBuildings() {
		return ResponseEntity.ok(buildingService.getUnassignedBuildings());
	}

	@PostMapping("/staff/allocation")
	public ResponseEntity<StaffBuildingMapDTO> allocateStaff(@RequestBody StaffBuildingMapDTO dto) {
		return ResponseEntity.ok(staffBuildingMapService.assign(dto));
	}

	@GetMapping("/staff/allocation/building/{buildingId}")
	public ResponseEntity<List<StaffBuildingMapDTO>> getStaffByBuilding(@PathVariable Long buildingId) {
		return ResponseEntity.ok(staffBuildingMapService.getByBuilding(buildingId));
	}

	@GetMapping("/qr/generate")
	public ResponseEntity<String> generateQr(@RequestParam String username) {
		return ResponseEntity.ok(qrCodeService.generateAttendanceQr(username));
	}

	@GetMapping("/stats")
	public ResponseEntity<AdminDashboardStatsDTO> getStats() {
		return ResponseEntity.ok(adminService.getDashboardStats());
	}

	@PostMapping("/staff/add")
	public ResponseEntity<UserDTO> addStaff(@RequestBody RegistrationRequest request) {
		return ResponseEntity.ok(adminService.addStaff(request));
	}

	@GetMapping("/staff/list")
	public ResponseEntity<List<StaffDTO>> listStaff() {
		return ResponseEntity.ok(adminService.getAllStaff());
	}

	@PutMapping("/staff/update/{staffId}")
	public ResponseEntity<StaffDTO> editStaff(@PathVariable Long staffId, @RequestBody StaffDTO dto) {
		return ResponseEntity.ok(adminService.updateStaff(staffId, dto));
	}

	@DeleteMapping("/users/{username}")
	public ResponseEntity<String> deleteUser(@PathVariable String username) {
		adminService.deleteUser(username);
		return ResponseEntity.ok("User deleted successfully");
	}
}
