package com.giproject.service.fees;

import java.math.BigDecimal;
import java.util.List;

public interface FeesBasicService {

	List<String> getAllWeights();

	List<List<String>> getFeeGrid();

	void saveOrUpdate(String weight, String distance, BigDecimal price);

	void addWeight(String weight);

	void deleteWeight(String weight);
}