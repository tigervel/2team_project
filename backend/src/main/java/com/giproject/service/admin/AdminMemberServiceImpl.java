package com.giproject.service.admin;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.giproject.dto.member.MemberDTO;
import com.giproject.entity.member.Member;
import com.giproject.repository.member.MemberRepository;
import com.giproject.service.member.MemberServiceImpl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
@Transactional
public class AdminMemberServiceImpl implements AdminMemberService {
	
	private final MemberRepository memberRepository;

    @Override
    public List<MemberDTO> getMembersByRole(String role) {
        List<Member> members = memberRepository.findByRole(role);
        return members.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MemberDTO> getAllMembers() {
        List<Member> members = memberRepository.findAll();
        return members.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MemberDTO> searchMembers(String keyword) {
        List<Member> members = memberRepository.findByMemIdContainingOrMemNameContaining(keyword, keyword);
        return members.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private MemberDTO convertToDto(Member member) {
    	MemberDTO dto = new MemberDTO(member.getMemId()
    			,member.getMemPw()
    			, member.getMemEmail(), 
    			member.getMemName(), member.getMemPhone(), 
    			member.getMemAddress(), member.getMemCreateIdDateTime(), 
    			member.getMemberRoleList());
    	
    	
        return dto;
    }

}