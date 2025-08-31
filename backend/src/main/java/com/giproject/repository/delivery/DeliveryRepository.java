package com.giproject.repository.delivery;

import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.delivery.DeliveryStatus;
import com.giproject.entity.payment.Payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    @Query("SELECT FUNCTION('DATE_FORMAT', d.completTime, '%Y-%m'), COUNT(d) FROM Delivery d GROUP BY FUNCTION('DATE_FORMAT', d.completTime, '%Y-%m')")
    List<Object[]> findMonthlyDeliveries();

    List<Delivery> findTop5ByStatusOrderByCompletTimeDesc(DeliveryStatus status);

	Optional<Delivery> findByPayment_PaymentNo(Long paymentNo);
	@Query("select p from Payment p where p.orderSheet.orderNo = :orderNo")
	Optional<Payment> findByOrderSheet_OrderNo(@Param("orderNo") Long orderNo);
}