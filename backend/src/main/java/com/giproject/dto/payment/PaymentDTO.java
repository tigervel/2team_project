package com.giproject.dto.payment;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
	
	private Long paymentNo;
	
	private Long orderSheetNo;
	
	private String paymentMethod;
	private String paymentStatus;
	private LocalDateTime paydAt;
}
