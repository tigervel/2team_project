package com.giproject.service.estimate;

import java.util.List;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.member.Member;

import jakarta.transaction.Transactional;

@Transactional
public interface EstimateService {

	default EstimateDTO entityToDTO(Estimate estimate) {
		EstimateDTO dto =  EstimateDTO.builder()
				.eno(estimate.getEno())
				.startAddress(estimate.getStartAddress())
				.endAddress(estimate.getEndAddress())
				.distanceKm(estimate.getDistanceKm())
				.cargoWeight(estimate.getCargoWeight())
				.cargoType(estimate.getCargoType())
				.startTime(estimate.getStartTime())
				.totalCost(estimate.getTotalCost())
				.isTemp(estimate.isTemp())
				.matched(estimate.isMatched())
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
				.isTemp(dto.isTemp())
				.matched(dto.isMatched())
				.member(member)
				.build();
		return estimate;
	}
	
	Long sendEstimate(EstimateDTO dto);
	
	Long saveDraft(EstimateDTO dto);
	
	EstimateDTO exportEstimate(String mameberId,Long eno);
	
	List<EstimateDTO> getSaveEstimate(String memberId);
}
