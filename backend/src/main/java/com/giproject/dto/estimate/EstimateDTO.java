package com.giproject.dto.estimate;

import java.time.LocalDateTime;
import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EstimateDTO {
	private Long eno;
	
	private String startAddress;
	private String endAddress;
	private int cargoWeight;
	private String cargoType;
	private LocalDateTime  startTime;
	private int totalCost;
}
