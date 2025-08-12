package com.giproject.service.fees;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.giproject.dto.fees.FeesDTO;
import com.giproject.entity.fees.Fees;
import com.giproject.repository.fees.FeesRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class FeesServiceImpl implements FeesService{
	
	private final FeesRepository feesRepository;

	@Override
	public FeesDTO saveOrUpdate(FeesDTO dto) {
	    Fees fees = (dto.getId() != null) ? feesRepository.findById(dto.getId()).orElse(new Fees()) : new Fees();
	    String dbType;
	    if ("basic".equalsIgnoreCase(dto.getType())) {
	        dbType = "기본요금";
	    } else if ("extra".equalsIgnoreCase(dto.getType())) {
	        dbType = "추가요금";
	    } else {
	        throw new IllegalArgumentException("Invalid fees type: " + dto.getType());
	    }
	    
	    fees.setType(dbType);
	    fees.setCategory(dto.getCategory());
	    fees.setDistance(dto.getDistance());
	    fees.setPrice(dto.getPrice());

	    Fees saved = feesRepository.save(fees);
	    
	    return FeesDTO.builder()
	            .id(saved.getId())
	            .type(saved.getType()) // DB에 저장된 한글 값 반환
	            .category(saved.getCategory())
	            .distance(saved.getDistance())
	            .price(saved.getPrice())
	            .build();
	}

    @Override
    public List<FeesDTO> getFeesByType(String type) {
        String dbType;
        if ("basic".equalsIgnoreCase(type)) {
            dbType = "기본요금";
        } else if ("extra".equalsIgnoreCase(type)) {
            dbType = "추가요금";
        } else {
            return List.of(); 
        }

        return feesRepository.findByType(dbType).stream()
                .map(f -> new FeesDTO(f.getId(), f.getType(), f.getCategory(), f.getDistance(), f.getPrice()))
                .collect(Collectors.toList());
    }
}