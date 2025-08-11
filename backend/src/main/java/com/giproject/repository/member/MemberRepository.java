package com.giproject.repository.member;

import com.giproject.entity.member.Member;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {
	
	List<Member> findByRole(String role);//역할별로 회원조회
	
    List<Member> findByMemIdContainingOrMemNameContaining(String memIdKeyword, String memNameKeyword);

}