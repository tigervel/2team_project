package com.giproject.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class OrderFormDTO {

    // 주문자 정보
    private String ordererName;
    private String ordererPhone;
    private String ordererEmail;

    // 출발지 정보
    private String startAddress;

    // 도착지 정보
    private String endAddress;

    // 요금 정보
    private int baseCost;
    private int distanceCost;
    private int specialOptionCost;
    private int totalCost;

    // 기타
    private Long matchingNo; // 주문 생성 시 매칭번호 필요
}