package com.giproject.controller.estimate;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.dto.matching.MatchingDTO;
import com.giproject.dto.matching.PageRequestDTO;
import com.giproject.dto.matching.PageResponseDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.matching.RejectedMatching;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.service.estimate.EstimateService;
import com.giproject.service.estimate.matching.MatchingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/g2i4/estimate")
public class EstimateController {

	private final EstimateService estimateService;
	private final MatchingService matchingService;
	private final CargoOwnerRepository cargoOwnerRepository;
	@PostMapping("/")
	public Map<String, Long> register(@RequestBody EstimateDTO dto){
		//Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		//String memId = auth.getName();
		dto.setMemberId("user");
		
		
		Long eno=estimateService.sendEstimate(dto);
		log.info("Received DTO: {}", eno);
		return Map.of("RESULT",eno);
		
	}
	
	@GetMapping("/list")
	public  PageResponseDTO<MatchingDTO> getEstimateList(PageRequestDTO dto) {
		return matchingService.getList(dto);
	}
	
	@PostMapping("/rejected")
	public ResponseEntity<Map<String, String>> reject(@RequestParam("estimateNo") Long estimateNo) {
		CargoOwner cargoOwner = cargoOwnerRepository.findById("cargo123").get();
		
		matchingService.rejectMatching(estimateNo, cargoOwner);
		
		return ResponseEntity.ok().body(Map.of("result", "reject"));
	}
}
