package com.giproject.service.member;

import java.util.stream.Collectors;

import com.giproject.dto.common.UserResponseDTO;
import com.giproject.dto.member.MemberDTO;
import com.giproject.entity.member.Member;

import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;

@Transactional
public interface MemberService {
    UserResponseDTO getSessionUserInfo(HttpSession session);

    MemberDTO getKakaoMember(String accessToken);
    MemberDTO getNaverMember(String accessToken);
    MemberDTO getGoogleMember(String accessToken);

    boolean isIdAvailable(String memId);

    // ⭐ 일반 회원가입 메서드 추가
    MemberDTO registerMember(MemberDTO dto);

    default MemberDTO entityToDTO(Member member) {
        System.out.println(member);
        MemberDTO dto = new MemberDTO(
                member.getMemId(),
                member.getMemPw(),
                member.getMemEmail(),
                member.getMemName(),
                member.getMemPhone(),
                member.getMemAddress(),
                member.getMemCreateIdDateTime(),
                member.getMemberRoleList().stream().collect(Collectors.toList())
        );
        System.out.println(dto);
        return dto;
    }
}
