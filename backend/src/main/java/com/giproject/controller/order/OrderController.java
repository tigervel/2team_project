package com.giproject.controller.order;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.order.McNoRequest;
import com.giproject.dto.order.OrderFormDTO;
import com.giproject.dto.order.OrderSheetDTO;
import com.giproject.service.order.OrderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/g2i4/subpath/order")
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/view")
    public ResponseEntity<?> viewOrder(@RequestBody(required = false) Map<String, Object> body) {
        // 🔎 들어온 바디 전부 찍기
        log.info("[ORDER][VIEW] raw body = {}", body);

        if (body == null) {
            log.warn("[ORDER][VIEW] body is null");
            return ResponseEntity.badRequest().body("body is required");
        }

        // 🔎 키 혼선 방지: mcNo / matchingNo 둘 다 체크
        Object raw = body.get("mcNo");
        if (raw == null) raw = body.get("matchingNo");

        if (!(raw instanceof Number)) {
            log.warn("[ORDER][VIEW] mcNo is missing or not number: {}", raw);
            return ResponseEntity.badRequest().body("mcNo is required (number)");
        }

        long mcNo = ((Number) raw).longValue();
        log.info("[ORDER][VIEW] mcNo = {}", mcNo);

        try {
            var dto = orderService.loadOrderForm(mcNo);
            // 필요하면 DTO에 @ToString 추가해서 핵심만 보이게
            log.info("[ORDER][VIEW] service OK, dto = {}", dto);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("[ORDER][VIEW] service FAILED, mcNo={}", mcNo, e);
            return ResponseEntity.status(500).body("internal error");
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody OrderSheetDTO dto) {
        log.info("[ORDER][CREATE] raw dto = {}", dto);

        Long no = dto.getMatchingNo();
        if (no == null) {
            log.warn("[ORDER][CREATE] matchingNo is null");
            return ResponseEntity.badRequest().body("matchingNo is required");
        }

        try {
            Long orderNo = orderService.placeOrderFromPayment(dto, no);
            log.info("[ORDER][CREATE] success, orderNo = {}", orderNo);
            return ResponseEntity.ok(orderNo);
        } catch (Exception e) {
            log.error("[ORDER][CREATE] FAILED, matchingNo={}", no, e);
            return ResponseEntity.status(500).body("internal error");
        }
    }
}
