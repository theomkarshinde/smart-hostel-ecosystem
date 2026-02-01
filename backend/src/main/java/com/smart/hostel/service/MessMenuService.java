package com.smart.hostel.service;

import com.smart.hostel.dto.MessMenuDTO;
import java.time.LocalDate;
import java.util.List;

public interface MessMenuService {
    MessMenuDTO addMenu(MessMenuDTO dto);

    List<MessMenuDTO> getMenuByDate(LocalDate date);
}
