package com.giproject.service.admin;

import java.util.List;

import com.giproject.dto.member.MemberDTO;

import jakarta.transaction.Transactional;

@Transactional
public interface AdminMemberService {

	List<MemberDTO> getAllMembers();// 전체 회원 조회

	List<MemberDTO> getMembersByRole(String role);// 역할별 회원 조회

	List<MemberDTO> searchMembers(String keyword);// 회원 검색
}
