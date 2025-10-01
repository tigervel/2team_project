package com.giproject.service.cargoowner;

import com.giproject.dto.common.UserResponseDTO;
import com.giproject.entity.cargo.CargoOwner;
import jakarta.servlet.http.HttpSession;

public interface CargoOwnerService {
    UserResponseDTO getSessionUserInfo(HttpSession session);

    // 신규 차주 회원가입
    CargoOwner registerCargoOwner(String name, String email, String phone, String address);
}
