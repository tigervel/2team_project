package com.giproject.repository.payment;

import com.giproject.entity.payment.PaymentStatus;

import java.util.List;
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
<<<<<<< HEAD

    List<Payment> findAllByPaymentStatus(PaymentStatus status);
=======
	    Optional<Payment> findByOrderSheet_Matching_MatchingNo(Long matchingNo);

>>>>>>> 1553a7fcd2f2678346f2c951ca9beed7f8a78fb8
}
