package com.giproject.dto.estimate;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EstimateDTO {
	private Long eno;
	
	private String startAddress;
	private String endAddress;
	private double distanceKm;
	private int cargoWeight;
	private String cargoType;
	private LocalDateTime  startTime;
	private int totalCost;
	private boolean matched;
	private String memberId;
	private boolean isTemp;
	private boolean isOrdered;
	private int baseCost;
	private int distanceCost;
	private int specialOption;
	
}
