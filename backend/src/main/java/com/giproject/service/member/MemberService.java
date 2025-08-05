package com.giproject.service.member;

import com.giproject.dto.common.UserResponseDTO;

import jakarta.servlet.http.HttpSession;

public interface MemberService {
    UserResponseDTO getSessionUserInfo(HttpSession session);
}
