package com.smart.hostel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smart.hostel.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByUsername(String username);

	Optional<User> findByResetToken(String resetToken);

	List<User> findByRole_RoleName(String roleName);

	boolean existsByUsername(String username);

	boolean existsByEmail(String email);
}
