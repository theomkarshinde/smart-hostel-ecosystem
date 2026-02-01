package com.smart.hostel.service;

import org.springframework.stereotype.Service;

import com.smart.hostel.dto.RoleDTO;
import com.smart.hostel.entity.Role;
import com.smart.hostel.repository.RoleRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RoleServiceImpl implements RoleService {

	private final RoleRepository roleRepository;

	@Override
	public RoleDTO createRole(RoleDTO dto) {
		Role role = new Role();
		role.setRoleName(dto.roleName());

		Role saved = roleRepository.save(role);

		return new RoleDTO(saved.getRoleId(), saved.getRoleName());
	}

	@Override
	public RoleDTO getRoleById(Integer id) {
		Role role = roleRepository.findById(id).orElse(null);
		if (role == null)
			return null;

		return new RoleDTO(role.getRoleId(), role.getRoleName());
	}
}
