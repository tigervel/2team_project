package com.giproject.controller;

import com.giproject.dto.member.MemberDTO;
import com.giproject.entity.member.Member;
import com.giproject.repository.member.MemberRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/g2i4/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberRepository memberRepository;

    //로그인된 사용자 정보 조회
    @GetMapping("/info")
    public MemberDTO getMemberInfo(HttpSession session) {
        String memId = (String) session.getAttribute("loginId"); // 세션에서 로그인한 아이디 가져오기
        Member member = memberRepository.findById(memId).orElseThrow(() -> new RuntimeException("회원 정보 없음"));

        return MemberDTO.builder()
                .memId(member.getMemId())
                .memPw(null) // 비밀번호는 전달하지 않음
                .memEmail(member.getMemEmail())
                .memName(member.getMemName())
                .memPhone(member.getMemPhone())
                .memAddress(member.getMemAddress())
                .memCreateIdDateTime(member.getMemCreateIdDateTime())
                .build();
    }

    // 회원 정보 수정
    @PostMapping("/update")
    public String updateMember(@RequestBody MemberDTO dto, HttpSession session) {
        String memId = (String) session.getAttribute("loginId");
        Member member = memberRepository.findById(memId)
                .orElseThrow(() -> new RuntimeException("회원 정보 없음"));

        // 변경 항목 적용
        member.changeMemAddress(dto.getMemAddress());
        member.changeMemPhone(dto.getMemPhone());

        memberRepository.save(member);
        return "회원 정보가 성공적으로 수정되었습니다.";
    }
}