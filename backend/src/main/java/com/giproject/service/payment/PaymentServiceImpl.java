package com.giproject.service.payment;

import org.springframework.stereotype.Service;

import com.giproject.dto.payment.PaymentDTO;
import com.giproject.entity.order.OrderSheet;
import com.giproject.entity.payment.Payment;
import com.giproject.repository.order.OrderRepository;
import com.giproject.repository.payment.PaymentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService  {
		private final PaymentRepository paymentRepository;
		private final OrderRepository orderRepository;
	@Transactional
	@Override
	public Payment acceptedPayment(Long orderSheetNo, PaymentDTO dto) {
		OrderSheet orderSheet=orderRepository.findById(orderSheetNo).orElseThrow();
		Payment payment = dtoToEntity(dto, orderSheet);
		
		return paymentRepository.save(payment);
	}
	
	
}
