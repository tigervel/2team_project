package com.giproject.controller.estimate;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.service.estimate.EstimateService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/g2i4/estimate")
public class EstimateController {

	private final EstimateService estimateService;
	@PostMapping("/")
	public Map<String, Long> register(@RequestBody EstimateDTO dto){
		//Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		//String memId = auth.getName();
		dto.setMemberId("user");
		
		
		Long eno=estimateService.requestEstimate(dto);
		log.info("Received DTO: {}", eno);
		return Map.of("RESULT",eno);
		
	}
}
