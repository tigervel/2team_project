package com.giproject.repository.estimate;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.member.Member;

public interface EsmateRepository extends JpaRepository<Estimate, Long>{
	
	
	@Query("Select m From Member m where m.memId =:memId")
	public Optional<Member> getMemId(@Param("memId") String memId) ;
	
	@Query("SELECT e FROM Estimate e WHERE e.isTemp = false")
	List<Estimate> findValidEstimates();
}
