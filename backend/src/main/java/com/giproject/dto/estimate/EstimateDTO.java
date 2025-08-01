package com.giproject.dto.estimate;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EstimateDTO {
	private Long eno;
	
	private String startAddress;
	private String endAddress;
	private int cargoWeight;
	private String cargoType;
	private Date startTime;
	private int totalCost;
}
