package com.giproject.repository.fees;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.giproject.entity.fees.FeesBasic;

public interface FeesBasicRepository extends JpaRepository<FeesBasic, Long> {
	Optional<FeesBasic> findByWeight(String weight);

    @Query("select distinct f.weight from FeesBasic f")
    List<String> findDistinctWeights();
    
    void deleteByWeight(String weight); 
}