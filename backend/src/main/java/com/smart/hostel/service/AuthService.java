package com.smart.hostel.service;

import com.smart.hostel.dto.AuthRequest;
import com.smart.hostel.dto.AuthResponse;
import com.smart.hostel.dto.RegistrationRequest;
import com.smart.hostel.dto.UserDTO;

public interface AuthService {
    AuthResponse login(AuthRequest request);

    UserDTO register(RegistrationRequest request);
}
