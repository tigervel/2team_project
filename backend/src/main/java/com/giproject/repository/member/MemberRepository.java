package com.giproject.repository.member;

import com.giproject.entity.member.Member;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MemberRepository extends JpaRepository<Member, String> {
	
	// 일반 로그인 (memId 기반)
	@EntityGraph(attributePaths = {"memberRoleList"})
	@Query("SELECT m FROM Member m WHERE m.memId = :memId")
	Member getWithRoles(@Param("memId") String memId);

	// 소셜 로그인 (email 기반)
	@EntityGraph(attributePaths = {"memberRoleList"})
	@Query("SELECT m FROM Member m WHERE m.memEmail = :memEmail")
	Optional<Member> getWithRolesByEmail(@Param("memEmail") String memEmail);
}