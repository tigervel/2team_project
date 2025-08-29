package com.giproject.controller.noboard;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.noboard.NoticeDTO;
import com.giproject.dto.noboard.NoticePageResponseDTO;
import com.giproject.service.noboard.NoticeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

/**
 * Notice REST API 컨트롤러
 * 
 * 공지사항의 모든 API 엔드포인트 제공
 * - 게시글 CRUD
 * - 페이지네이션 및 검색
 * 
 * TODO: Spring Security JWT 토큰 기반 인증 적용 필요
 * 현재는 테스트용으로 임시 사용자 정보 사용 (X-User-Id, X-User-Name 헤더)
 */
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
@Log4j2
public class NoticeController {

    private final NoticeService noticeService;

    /**
     * 공지사항 목록 조회
     * 
     * @param keyword 검색어 (선택)
     * @param page 페이지 번호 (0부터 시작, 기본값: 0)
     * @param size 페이지 크기 (기본값: 10)
     * @return 페이지네이션된 공지사항 목록
     */
    @GetMapping
    public ResponseEntity<NoticePageResponseDTO<NoticeDTO.ListResponse>> getNoticeList(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        log.info("GET /api/notices - keyword: {}, page: {}, size: {}", keyword, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        NoticePageResponseDTO<NoticeDTO.ListResponse> response = 
                noticeService.getNoticeList(keyword, pageable);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 공지사항 상세 조회
     * 
     * @param noticeId 공지사항 ID
     * @return 공지사항 상세 정보
     */
    @GetMapping("/{noticeId}")
    public ResponseEntity<NoticeDTO> getNoticeDetail(@PathVariable("noticeId") Long noticeId) {
        log.info("GET /api/notices/{}", noticeId);
        
        NoticeDTO response = noticeService.getNoticeDetail(noticeId);
        return ResponseEntity.ok(response);
    }

    /**
     * 공지사항 작성 (관리자 전용)
     * 
     * @param createRequest 공지사항 작성 요청 데이터
     * @param authorId 작성자 ID (관리자)
     * @param authorName 작성자 이름 (관리자)
     * @return 생성된 공지사항 정보
     */
    @PostMapping
    public ResponseEntity<NoticeDTO> createNotice(@Valid @RequestBody NoticeDTO.CreateRequest createRequest,
                                               @RequestHeader("X-User-Id") String authorId,
                                               @RequestHeader("X-User-Name") String authorName) {
        // URL 인코딩된 사용자명 디코딩
        try {
            authorName = java.net.URLDecoder.decode(authorName, "UTF-8");
        } catch (Exception e) {
            log.warn("Failed to decode author name: {}", authorName);
        }
        
        log.info("POST /api/notices - title: {}, authorId: {}, authorName: {}", 
                 createRequest.getTitle(), authorId, authorName);
        
        // TODO: 실제 관리자 권한 검증 로직 추가 (Spring Security)
        if (!authorId.toLowerCase().contains("admin")) {
            throw new SecurityException("공지사항 작성 권한이 없습니다.");
        }

        NoticeDTO response = noticeService.createNotice(createRequest, authorId, authorName);
        return ResponseEntity.ok(response);
    }

    /**
     * 공지사항 수정 (관리자 전용)
     * 
     * @param noticeId 공지사항 ID
     * @param updateRequest 공지사항 수정 요청 데이터
     * @param userId 현재 사용자 ID (관리자)
     * @param authorName 작성자 이름 (관리자)
     * @return 수정된 공지사항 정보
     */
    @PutMapping("/{noticeId}")
    public ResponseEntity<NoticeDTO> updateNotice(@PathVariable("noticeId") Long noticeId,
                                               @Valid @RequestBody NoticeDTO.UpdateRequest updateRequest,
                                               @RequestHeader("X-User-Id") String userId,
                                               @RequestHeader("X-User-Name") String authorName) {
        log.info("PUT /api/notices/{} - 헤더 수신 확인 - userId: {}, authorName(인코딩됨): {}", noticeId, userId, authorName);
        
        // URL 인코딩된 사용자명 디코딩
        try {
            String decodedAuthorName = java.net.URLDecoder.decode(authorName, "UTF-8");
            log.info("authorName 디코딩 결과: '{}' -> '{}'", authorName, decodedAuthorName);
            authorName = decodedAuthorName;
        } catch (Exception e) {
            log.warn("Failed to decode author name: {}", authorName);
        }
        
        log.info("PUT /api/notices/{} - 최종 전달값 - userId: {}, authorName: {}", noticeId, userId, authorName);
        
        // TODO: 실제 관리자 권한 검증 로직 추가 (Spring Security)
        if (!userId.toLowerCase().contains("admin")) {
            throw new SecurityException("공지사항 수정 권한이 없습니다.");
        }

        NoticeDTO response = noticeService.updateNotice(noticeId, updateRequest, userId, authorName);
        return ResponseEntity.ok(response);
    }

    /**
     * 공지사항 삭제 (관리자 전용)
     * 
     * @param noticeId 공지사항 ID
     * @param userId 현재 사용자 ID (관리자)
     * @return 성공 메시지
     */
    @DeleteMapping("/{noticeId}")
    public ResponseEntity<Map<String, String>> deleteNotice(@PathVariable("noticeId") Long noticeId,
                                                         @RequestHeader("X-User-Id") String userId) {
        log.info("DELETE /api/notices/{} - userId: {}", noticeId, userId);
        
        // TODO: 실제 관리자 권한 검증 로직 추가 (Spring Security)
        if (!userId.toLowerCase().contains("admin")) {
            throw new SecurityException("공지사항 삭제 권한이 없습니다.");
        }

        noticeService.deleteNotice(noticeId, userId);
        
        return ResponseEntity.ok(Map.of("message", "공지사항이 성공적으로 삭제되었습니다."));
    }
}