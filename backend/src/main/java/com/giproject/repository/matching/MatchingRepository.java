package com.giproject.repository.matching;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;

public interface MatchingRepository extends JpaRepository<Matching, Long> {

	@Query("""
			SELECT m FROM Matching m
			WHERE m.estimate.isTemp = false
			  AND m.estimate.matched = false
			  AND m.estimate NOT IN (
			    SELECT r.estimate FROM RejectedMatching r WHERE r.cargoOwner = :cargoOwner
			)
			""")
	Page<Matching> findValidMatchingList(@Param("cargoOwner") CargoOwner cargoOwner, Pageable pageable);

}
