package com.giproject.entity.payment;

import java.time.LocalDateTime;

import com.giproject.entity.order.OrderSheet;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Payment")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long paymentNo;
	
	@OneToOne
	@JoinColumn(name = "orderSheetNo")
	private OrderSheet orderSheet;
	
	private String paymentMethod;
	private String paymentStatus;
	private LocalDateTime paydAt;
	
}
