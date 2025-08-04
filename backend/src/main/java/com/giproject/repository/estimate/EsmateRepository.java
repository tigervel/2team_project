package com.giproject.repository.estimate;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.member.Member;

public interface EsmateRepository extends JpaRepository<Estimate, Long>{
	
	
	@Query("Select m From Member m where m.memId =:memId")
	public Optional<Member> getMemId(String memId) ;
}
