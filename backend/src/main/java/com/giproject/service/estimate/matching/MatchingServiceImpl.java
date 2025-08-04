package com.giproject.service.estimate.matching;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.giproject.dto.matching.MatchingDTO;
import com.giproject.dto.matching.PageRequestDTO;
import com.giproject.dto.matching.PageResponseDTO;
import com.giproject.entity.matching.Matching;
import com.giproject.repository.matching.MatchingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class MatchingServiceImpl implements MatchingService{
	
	private final MatchingRepository matchingRepository;
	

	@Override
	public PageResponseDTO<MatchingDTO> getList(PageRequestDTO requestDTO) {
		Pageable pageable= PageRequest.of(requestDTO.getPage()-1, requestDTO.getSize(),Sort.by("matchingNo").descending());
		Page<Matching> result = matchingRepository.findAll(pageable);
		System.out.println(result);
		List<MatchingDTO> dtoList = result.getContent().stream().map(this::entityToDTO).collect(Collectors.toList());
		System.out.println(dtoList);
		
		long totalCount = result.getTotalElements();
		return PageResponseDTO.<MatchingDTO>withAll()
				.dtoList(dtoList)
				.pageRequestDTO(requestDTO)
				.totalCount(totalCount)
				.build();
	}

}
