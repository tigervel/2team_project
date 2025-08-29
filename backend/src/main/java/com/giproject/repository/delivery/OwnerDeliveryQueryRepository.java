package com.giproject.repository.delivery;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import com.giproject.dto.delivery.DeliveryRowDTO;
import com.giproject.entity.delivery.DeliveryStatus;

public interface OwnerDeliveryQueryRepository extends Repository<com.giproject.entity.delivery.Delivery, Long> {

    // 미결제: 매칭O, 주문서O, Payment 없음
    @Query("""
        select new com.giproject.dto.delivery.DeliveryRowDTO(
            e.eno, e.cargoType, e.cargoWeight, e.startAddress, e.endAddress, e.startTime,
            co.cargoName, null, m.matchingNo, null
        )
        from Matching m
        join m.estimate e
        join m.cargoOwner co
        left join m.orderSheet os
        left join os.payment p
        where co.cargoId = :cargoId
          and m.isAccepted = true
          and os is not null
          and p is null
        order by e.eno desc
    """)
    List<DeliveryRowDTO> findUnpaidByCargoId(String cargoId);

    // 결제됨(진행중/대기): Payment 있음 + Delivery.status != COMPLETED (또는 Delivery가 없으면 PENDING으로 간주하고 생성 시점에 만들게 할 수도 있음)
    @Query("""
        select new com.giproject.dto.delivery.DeliveryRowDTO(
            e.eno, e.cargoType, e.cargoWeight, e.startAddress, e.endAddress, e.startTime,
            co.cargoName, d.status, m.matchingNo, d.completTime
        )
        from Matching m
        join m.estimate e
        join m.cargoOwner co
        join m.orderSheet os
        join os.payment p
        left join com.giproject.entity.delivery.Delivery d on d.payment = p
        where co.cargoId = :cargoId
          and m.isAccepted = true
          and (d.status is null or d.status <> com.giproject.entity.delivery.DeliveryStatus.COMPLETED)
        order by e.eno desc
    """)
    List<DeliveryRowDTO> findPaidInProgressByCargoId(String cargoId);

    // 완료: Delivery.status = COMPLETED
    @Query("""
        select new com.giproject.dto.delivery.DeliveryRowDTO(
            e.eno, e.cargoType, e.cargoWeight, e.startAddress, e.endAddress, e.startTime,
            co.cargoName, d.status, m.matchingNo, d.completTime
        )
        from Matching m
        join m.estimate e
        join m.cargoOwner co
        join m.orderSheet os
        join os.payment p
        join com.giproject.entity.delivery.Delivery d on d.payment = p
        where co.cargoId = :cargoId
          and m.isAccepted = true
          and d.status = com.giproject.entity.delivery.DeliveryStatus.COMPLETED
        order by e.eno desc
    """)
    List<DeliveryRowDTO> findCompletedByCargoId(String cargoId);
}