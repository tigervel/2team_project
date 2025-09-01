package com.giproject.repository.delivery;

import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.delivery.DeliveryStatus;
import com.giproject.entity.payment.Payment;
import com.giproject.repository.owner.MonthlyRevenueRow;

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
 // matchingNo로 Delivery 찾기
   Delivery save(Delivery d);


    @Query("""
        select d
        from Delivery d
        join d.payment p
        join p.orderSheet os
        join os.matching m
        where m.matchingNo = :matchingNo
    """)
    Optional<Delivery> findByMatchingNo(@Param("matchingNo") Long matchingNo);

    @Query("""
        select d
        from Delivery d
        join d.payment p
        join p.orderSheet os
        join os.matching m
        join m.cargoOwner co
        where m.matchingNo = :matchingNo
          and co.cargoId = :cargoId
    """)
    Optional<Delivery> findByMatchingNoAndCargoId(@Param("matchingNo") Long matchingNo,
                                                  @Param("cargoId") String cargoId);
    
    @Query(value = """
            SELECT
                YEAR(d.complet_time) AS y,
                MONTH(d.complet_time) AS m,
                SUM(e.total_cost)     AS revenue
            FROM 2teamproject.delivery d
            JOIN 2teamproject.payment      p  ON p.payment_no   = d.payment_no
            JOIN 2teamproject.order_sheet  os ON os.order_no    = p.order_sheet_no
            JOIN 2teamproject.matching     mt ON mt.matching_no = os.matching_no
            JOIN 2teamproject.estimate     e  ON e.eno          = mt.eno
            WHERE d.status = 'COMPLETED'
              AND mt.cargo_id = :cargoId
              AND d.complet_time IS NOT NULL
            GROUP BY YEAR(d.complet_time), MONTH(d.complet_time)
            ORDER BY y, m
            """, nativeQuery = true)
        List<MonthlyRevenueRow> findMonthlyRevenueByCargoId(@Param("cargoId") String cargoId);
}