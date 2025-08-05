package com.giproject.repository.estimate;

import org.springframework.data.jpa.repository.JpaRepository;

import com.giproject.entity.estimate.TempEstimate;

public interface TempEstimateRepository  extends JpaRepository<TempEstimate, Long>{

}
