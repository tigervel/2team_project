package com.giproject.controller.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.member.MemberDTO;
import com.giproject.service.admin.AdminMemberService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/admin/members")
public class AdminMemberController {

	private final AdminMemberService adminMemberService;
	
	@GetMapping
    public ResponseEntity<List<MemberDTO>> getMembersByRole(@RequestParam(defaultValue = "all") String role) {
        log.info("회원 조회 - 역할: " + role);
        List<MemberDTO> members;

        if ("all".equalsIgnoreCase(role)) {
            members = adminMemberService.getAllMembers();
        } else {
            members = adminMemberService.getMembersByRole(role);
        }

        return ResponseEntity.ok(members);
    }

    @GetMapping("/search")
    public ResponseEntity<List<MemberDTO>> searchMembers(@RequestParam String keyword) {
        log.info("회원 검색 요청 - 키워드: " + keyword);
        List<MemberDTO> members = adminMemberService.searchMembers(keyword);
        return ResponseEntity.ok(members);
    }
}
