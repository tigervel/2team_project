package com.giproject.service.estimate;

import org.springframework.stereotype.Service;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.entity.estimate.Estimate;
import com.giproject.repository.estimate.EsmateRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class EstimateServiceImpl implements EstimeateService{
	private final EsmateRepository esmateRepository;
	
	@Override
	public void requstEstimate(EstimateDTO dto) {
		Estimate estimate= DTOToEntity(dto);
		esmateRepository.save(estimate);
	}
}
