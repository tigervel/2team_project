package com.giproject.service.estimate;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.entity.estimate.Estimate;

import jakarta.transaction.Transactional;

@Transactional
public interface EstimateService {

	default EstimateDTO entityToDTO(Estimate estimate) {
		EstimateDTO dto =  new EstimateDTO(estimate.getEno(), estimate.getStartAddress(),
				estimate.getEndAddress(),
				estimate.getCargoWeight(),
				estimate.getCargoType(),
				estimate.getStartTime(),
				estimate.getTotalCost()) ;
		return dto;
	}
	
	default Estimate DTOToEntity(EstimateDTO dto) {
		Estimate estimate= new Estimate(dto.getEno(),
				dto.getStartAddress(),
				dto.getEndAddress(),
				dto.getCargoWeight(),
				dto.getCargoType(),
				dto.getStartTime(),
				dto.getTotalCost());
		return estimate;
	}
	
	void requestEstimate(EstimateDTO dto);
}
