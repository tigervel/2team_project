package com.giproject.repository.delivery;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.delivery.DeliveryStatus;
import com.giproject.entity.payment.Payment;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

	@Query("SELECT FUNCTION('DATE_FORMAT', d.completTime, '%Y-%m'), COUNT(d) FROM Delivery d GROUP BY FUNCTION('DATE_FORMAT', d.completTime, '%Y-%m')")
	List<Object[]> findMonthlyDeliveries();

	List<Delivery> findTop5ByStatusOrderByCompletTimeDesc(DeliveryStatus status);

			@Query("select d from Delivery d join d.payment p where p.orderSheet.orderNo = :orderNo")
	Optional<Delivery> findByOrderSheet_OrderNo(@Param("orderNo") Long orderNo);

	Optional<Delivery> findByPayment_PaymentNo(Long paymentNo);

	// 물주(Member)의 배송 내역 조회 (새로운 쿼리)
    @Query("SELECT d FROM Delivery d JOIN d.payment p JOIN p.orderSheet os JOIN os.matching mt JOIN mt.estimate e JOIN e.member m WHERE m.memId = :memId")
    List<Delivery> findDeliveriesByOwnerMemId(@Param("memId") String memId);

	// 차주(CargoOwner)의 배송 내역 조회 (새로운 쿼리)
    @Query("SELECT d FROM Delivery d JOIN d.payment p JOIN p.orderSheet os JOIN os.matching mt JOIN mt.cargoOwner co WHERE co.cargoId = :cargoId")
    List<Delivery> findDeliveriesByCargoOwnerCargoId(@Param("cargoId") String cargoId);
}

	

	