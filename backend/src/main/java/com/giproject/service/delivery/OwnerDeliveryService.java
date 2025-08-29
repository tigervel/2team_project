package com.giproject.service.delivery;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.giproject.dto.delivery.DeliveryRowDTO;
import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.delivery.DeliveryStatus;
import com.giproject.entity.payment.Payment;
import com.giproject.repository.delivery.DeliveryRepository;
import com.giproject.repository.delivery.OwnerDeliveryQueryRepository;
import com.giproject.repository.payment.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OwnerDeliveryService {

    private final OwnerDeliveryQueryRepository queryRepo;
    private final DeliveryRepository deliveryRepo;
    private final PaymentRepository paymentRepo;

    public List<DeliveryRowDTO> getUnpaid(String cargoId) {
        return queryRepo.findUnpaidByCargoId(cargoId);
    }

    public List<DeliveryRowDTO> getPaidInProgress(String cargoId) {
        return queryRepo.findPaidInProgressByCargoId(cargoId);
    }

    public List<DeliveryRowDTO> getCompleted(String cargoId) {
        return queryRepo.findCompletedByCargoId(cargoId);
    }

    /** 배송 완료 처리 */
    @Transactional
    public void completeByMatchingNo(Long matchingNo, String cargoId) {
        // 1) matchingNo로 Delivery 찾기(없으면 Payment 찾아서 생성)
        Optional<Delivery> opt = deliveryRepo.findByMatchingNo(matchingNo);

        Delivery delivery = opt.orElseGet(() -> {
            // Delivery가 없으면 Payment를 찾고 새로 만든다.
            Payment p = paymentRepo.findByOrderSheet_Matching_MatchingNo(matchingNo)
                    .orElseThrow(() -> new IllegalArgumentException("결제 정보가 없습니다."));
            Delivery d = Delivery.builder()
                    .payment(p)
                    .status(DeliveryStatus.PENDING)
                    .build();
            return deliveryRepo.save(d);
        });

        // 2) 완료로 전환
        delivery.markCompleted();
        // JPA dirty checking
    }
}
