package com.giproject.service.payment;

import java.time.LocalDateTime;

import com.giproject.dto.payment.PaymentDTO;
import com.giproject.entity.order.OrderSheet;
import com.giproject.entity.payment.Payment;

public interface PaymentService {
	
	default PaymentDTO entityToDTO(Payment payment) {
		PaymentDTO dto = PaymentDTO.builder()
				.paymentNo(payment.getPaymentNo())
				.orderSheetNo(payment.getOrderSheet().getOrderNo())
				.paymentMethod(payment.getPaymentMethod())
				.paymentStatus(payment.getPaymentStatus())
				.paydAt(LocalDateTime.now())
				.build();
		return dto;
	}
	
	default Payment dtoToEntity(PaymentDTO dto, OrderSheet orderSheet) {
		Payment payment = Payment.builder()
				.paymentNo(dto.getPaymentNo())
				.orderSheet(orderSheet)
				.paymentMethod(dto.getPaymentMethod())
				.paymentStatus(dto.getPaymentStatus())
				.paydAt(dto.getPaydAt())
				.build();
		
		return payment;
	}
	public Payment acceptedPayment(Long orderStheetDTO , PaymentDTO dto);
}
