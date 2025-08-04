package com.giproject.service.estimate;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.member.Member;
import com.giproject.repository.estimate.EsmateRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class EstimateServiceImpl implements EstimateService{
	private final EsmateRepository esmateRepository;
	
	@Override
	public Long requestEstimate(EstimateDTO dto) {
		Member member= esmateRepository.getMemId(dto.getMemberId()).orElseThrow();
		Estimate estimate= DTOToEntity(dto,member);
		esmateRepository.save(estimate);
		return estimate.getEno();
	}
	

}
