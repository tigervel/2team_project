package com.giproject;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.service.estimate.EstimateService;

import jakarta.transaction.Transactional;
@Transactional
@SpringBootTest
@Rollback(false) 
public class EstimateTest {
	
	@Autowired
	EstimateService estimateService;
	//@Test
	void contextLoads() {
			System.out.println("1수정");
	}
	
	@Test
	void test() {
		EstimateDTO dto =  EstimateDTO.builder().startAddress("서울시")
		.endAddress("김포시")
		.cargoWeight(9999)
		.cargoType("물류")
		.startTime(LocalDateTime.of(2025, 11,1,15,30))
		.totalCost(1000000)
		.build();
			
	
		
		estimateService.requestEstimate(dto);
				
				
	}
}
