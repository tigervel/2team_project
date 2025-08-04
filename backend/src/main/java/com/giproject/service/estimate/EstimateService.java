package com.giproject.service.estimate;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.member.Member;

import jakarta.transaction.Transactional;

@Transactional
public interface EstimateService {

	default EstimateDTO entityToDTO(Estimate estimate) {
		EstimateDTO dto =  EstimateDTO.builder()
				.startAddress(estimate.getStartAddress())
				.endAddress(estimate.getEndAddress())
				.distanceKm(estimate.getDistanceKm())
				.cargoWeight(estimate.getCargoWeight())
				.cargoType(estimate.getCargoType())
				.startTime(estimate.getStartTime())
				.totalCost(estimate.getTotalCost())
				.memberId(estimate.getMember().getMemId())
				.build();
		return dto;
	}
	
	default Estimate DTOToEntity(EstimateDTO dto,Member member) {
		Estimate estimate= Estimate.builder()
				.startAddress(dto.getStartAddress())
				.endAddress(dto.getEndAddress())
				.cargoWeight(dto.getCargoWeight())
				.distanceKm(dto.getDistanceKm())
				.cargoType(dto.getCargoType())
				.startTime(dto.getStartTime())
				.totalCost(dto.getTotalCost())
				.member(member)
				.build();
		return estimate;
	}
	
	Long requestEstimate(EstimateDTO dto);
}
