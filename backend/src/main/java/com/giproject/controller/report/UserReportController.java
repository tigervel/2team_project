package com.giproject.controller.report;

import com.giproject.dto.report.UserReportDTO;
import com.giproject.service.report.UserReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/g2i4/admin/reports")
public class UserReportController {

    private final UserReportService service;

    @GetMapping("/unread-count")//사이드바 뱃지 미확인 개수
    public ResponseEntity<Long> unreadCount() {
        return ResponseEntity.ok(service.countUnread());
    }

    @GetMapping//신고목록 조회
    public ResponseEntity<Page<UserReportDTO>> list(
            @RequestParam(name = "unreadOnly", required = false) Boolean unreadOnly,
            @RequestParam(name = "keyword", required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return ResponseEntity.ok(service.list(unreadOnly, keyword, pageable));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<UserReportDTO> markRead(
            @PathVariable("id") Long id,
            @RequestParam(name = "read") boolean read
    ) {
        return ResponseEntity.ok(service.markRead(id, read));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Integer> markAllRead() {
        return ResponseEntity.ok(service.markAllRead());
    }
}
