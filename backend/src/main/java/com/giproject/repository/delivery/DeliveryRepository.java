package com.giproject.repository.delivery;

import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.delivery.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    @Query("SELECT FUNCTION('DATE_FORMAT', d.completTime, '%Y-%m'), COUNT(d) FROM Delivery d GROUP BY FUNCTION('DATE_FORMAT', d.completTime, '%Y-%m')")
    List<Object[]> findMonthlyDeliveries();

    List<Delivery> findTop5ByStatusOrderByCompletTimeDesc(DeliveryStatus status);

}
