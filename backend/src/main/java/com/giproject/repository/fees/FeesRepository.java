package com.giproject.repository.fees;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.giproject.entity.fees.Fees;

public interface FeesRepository extends JpaRepository<Fees, Long>{

	List<Fees> findByType(String type);
}
