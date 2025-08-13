package com.giproject.repository.payment;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.giproject.entity.payment.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long>{

	@EntityGraph(attributePaths = {
		    "orderSheet",
		    "orderSheet.matching",
		    "orderSheet.matching.cargoOwner",
		    "orderSheet.matching.estimate"
		})
		Optional<Payment> findByPaymentNo(Long id);
}
