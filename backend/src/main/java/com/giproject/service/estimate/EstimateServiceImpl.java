package com.giproject.service.estimate;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.member.Member;
import com.giproject.repository.estimate.EsmateRepository;
import com.giproject.repository.matching.MatchingRepository;
import com.giproject.service.estimate.matching.MatchingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class EstimateServiceImpl implements EstimateService{
	private final EsmateRepository esmateRepository;
	private final MatchingRepository matchingRepository;

	
	
	@Override
	public Long sendEstimate(EstimateDTO dto) {
		Member member= esmateRepository.getMemId(dto.getMemberId()).orElseThrow();
		Estimate estimate= DTOToEntity(dto,member);
		esmateRepository.save(estimate);
		
		Matching matching = Matching.builder()
				.estimate(estimate)
				.isAccepted(false)
				.build();
		matchingRepository.save(matching);
				return estimate.getEno();
	}

	@Override
	public Long saveDraft(EstimateDTO dto) {
		
		return null;
	}
	

}
