package com.giproject.repository.fees;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.giproject.entity.fees.FeesExtra;

public interface FeesExtraRepository extends JpaRepository<FeesExtra, Long> {
	Optional<FeesExtra> findByExtraChargeTitle(String extraChargeTitle);

	@Query("select distinct f.extraChargeTitle from FeesExtra f")
	List<String> findDistinctTitles();
	
	void deleteByExtraChargeTitle(String extraChargeTitle);
}