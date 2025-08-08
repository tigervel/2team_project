package com.giproject.service.member;

import com.giproject.dto.common.UserResponseDTO;
import com.giproject.entity.member.Member;
import com.giproject.repository.member.MemberRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;

    @Override
    public UserResponseDTO getSessionUserInfo(HttpSession session) {
        Member member = (Member) session.getAttribute("member");

        return new UserResponseDTO(
            member.getMemId(),
            member.getMemName(),
            member.getMemEmail(),
            member.getMemPhone(),
            member.getMemAddress(),
            member.getMemCreateIdDateTime()
        );
    }
}