package com.smart.hostel.service;

import com.smart.hostel.dto.RoleDTO;

public interface RoleService {
	RoleDTO createRole(RoleDTO dto);

	RoleDTO getRoleById(Integer id);
}
