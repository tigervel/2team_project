package com.giproject.repository.member;

import com.giproject.entity.member.Member;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {

	@Query("select m from Member m where :role member of m.memberRoleList")
	List<Member> findByRole(@Param("role") String role);
	
    Optional<Member> findByMemEmail(String memEmail);
    
    Optional<Member> findByMemId(String memId);
	
    List<Member> findByMemIdContainingOrMemNameContaining(String memIdKeyword, String memNameKeyword);

    List<Member> findByMemNameContainingIgnoreCaseOrMemEmailContainingIgnoreCaseOrMemPhoneContainingIgnoreCase(String memName, String memEmail, String memPhone);

	// 일반 로그인 (memId 기반)
	@EntityGraph(attributePaths = { "memberRoleList" })
	@Query("SELECT m FROM Member m WHERE m.memId = :memId")
	Member getWithRoles(@Param("memId") String memId);

	// 소셜 로그인 (email 기반)
	@EntityGraph(attributePaths = { "memberRoleList" })
	@Query("SELECT m FROM Member m WHERE m.memEmail = :memEmail")
	Optional<Member> getWithRolesByEmail(@Param("memEmail") String memEmail);

    long countByMemCreateIdDateTimeAfter(LocalDateTime date);

    @Query("SELECT FUNCTION('DATE_FORMAT', m.memCreateIdDateTime, '%Y-%m'), COUNT(m) FROM Member m GROUP BY FUNCTION('DATE_FORMAT', m.memCreateIdDateTime, '%Y-%m')")
    List<Object[]> findNewMembersByMonth();
}