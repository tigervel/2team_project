package com.giproject.controller.report;

import com.giproject.dto.report.UserReportDTO;
import com.giproject.service.report.UserReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/reports")
public class UserReportController {

    private final UserReportService service;

    @GetMapping("/unread-count")//사이드바 뱃지 미확인 개수
    public ResponseEntity<Long> unreadCount() {
        return ResponseEntity.ok(service.countUnread());
    }

    @GetMapping
    public ResponseEntity<Page<UserReportDTO>> list(
            @RequestParam(required = false) Boolean unreadOnly,
            @RequestParam(required = false) String keyword,
            Pageable pageable
    ) {
        return ResponseEntity.ok(service.list(unreadOnly, keyword, pageable));
    }

    @PatchMapping("/{id}/read")//읽음 처리
    public ResponseEntity<UserReportDTO> markRead(
            @PathVariable Long id,
            @RequestParam boolean read
    ) {
        return ResponseEntity.ok(service.markRead(id, read));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Integer> markAllRead() {
        return ResponseEntity.ok(service.markAllRead());
    }

    @PostMapping
    public ResponseEntity<UserReportDTO> create(@RequestBody UserReportDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }
}
