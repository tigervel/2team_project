package com.giproject.service.fees;

import java.util.List;

import com.giproject.dto.fees.FeesDTO;

public interface FeesService {
	FeesDTO saveOrUpdate(FeesDTO dto);

	List<FeesDTO> getFeesByType(String type);
}
