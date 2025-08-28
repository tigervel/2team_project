package com.giproject.repository.delivery;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.payment.Payment;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
	Optional<Delivery> findByPayment_PaymentNo(Long paymentNo);
	@Query("select p from Payment p where p.orderSheet.orderNo = :orderNo")
	Optional<Payment> findByOrderSheet_OrderNo(@Param("orderNo") Long orderNo);
}
