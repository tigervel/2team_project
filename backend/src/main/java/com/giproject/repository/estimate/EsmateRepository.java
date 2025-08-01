package com.giproject.repository.estimate;

import org.springframework.data.jpa.repository.JpaRepository;

import com.giproject.entity.estimate.Estimate;

public interface EsmateRepository extends JpaRepository<Estimate, Long>{

}
