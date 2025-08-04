package com.giproject.repository.matching;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;

public interface MatchingRepository extends JpaRepository<Matching,Long> {
	
	@Query("SELECT e FROM Estimate e WHERE e.isTemp = false")
	List<Estimate> findValidEstimates();
}
