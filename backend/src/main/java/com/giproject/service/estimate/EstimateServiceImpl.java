package com.giproject.service.estimate;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
	public Long saveDraft(EstimateDTO estimateDTO) {
		
		Member member = esmateRepository.getMemId(estimateDTO.getMemberId()).orElseThrow();
		int count = esmateRepository.estimateCount(member.getMemId()); //임시저장 갯수 확인
		
		if(count>=3) {
			throw new IllegalStateException("임시저장은 최대 3개까지 가능합니다.");
		}
		estimateDTO.setTemp(true);
		Estimate estimate= DTOToEntity(estimateDTO, member);
		
		esmateRepository.save(estimate);
		return estimate.getEno();
	}


	@Override
	public List<EstimateDTO> getSaveEstimate(String memberId) {
		List<Estimate> tempEstimate = esmateRepository.saveEstimateList(memberId);
		
		return tempEstimate.stream()
				.map(this::entityToDTO)
				.collect(Collectors.toList());
	}

	@Override
	public EstimateDTO exportEstimate(String mameberId, Long eno) {
		Estimate estimate = esmateRepository.exportEs(mameberId, eno);
		EstimateDTO dto = entityToDTO(estimate);
		return dto;
		
	}

	@Override
	public List<EstimateDTO> myEstimateList(String memberId) {
		List<Estimate> esList = esmateRepository.getMyEstimate(memberId);
		
		return esList.stream()
				.map(this::entityToDTO)
				.collect(Collectors.toList());
	}
	
	

}

