// com.giproject.dto.delivery.DeliveryRowDTO
package com.giproject.dto.delivery;

import java.time.LocalDateTime;

import com.giproject.entity.delivery.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DeliveryRowDTO {
    private Long eno;                 // 견적 번호
    private String cargoType;         // 화물명
    private String cargoWeight;       // 무게(문자열 컬럼)
    private String startAddress;      // 출발지
    private String endAddress;        // 도착지
    private LocalDateTime startTime;  // 배송 시작 예정일(견적)
    private String driverName;        // 차주 이름
    private DeliveryStatus deliveryStatus; // PENDING/IN_TRANSIT/COMPLETED (미결제는 null)
    private Long matchingNo;          // 매칭 번호
    private LocalDateTime deliveryCompletedAt; // 완료 시각
}
