package com.giproject.controller.qaboard;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.qaboard.AdminResponseDTO;
import com.giproject.dto.qaboard.PageResponseDTO;
import com.giproject.dto.qaboard.QAPostDTO;
import com.giproject.service.qaboard.AdminResponseService;
import com.giproject.service.qaboard.QABoardService;
import com.giproject.service.qaboard.QACategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

/**
 * QABoard REST API 컨트롤러
 * 
 * QA게시판의 모든 API 엔드포인트 제공
 * - 게시글 CRUD
 * - 관리자 답변 관리
 * - 카테고리 조회
 * - 페이지네이션 및 검색
 * 
 * TODO: Spring Security JWT 토큰 기반 인증 적용 필요
 * 현재는 테스트용으로 임시 사용자 정보 사용
 */
@RestController
@RequestMapping("/api/qaboard")
@RequiredArgsConstructor
@Log4j2
public class QABoardController {

    private final QABoardService qaBoardService;
    private final AdminResponseService adminResponseService;
    private final QACategoryService qaCategoryService;

    /**
     * 게시글 목록 조회
     * 
     * @param category 카테고리 필터 (선택)
     * @param keyword 검색어 (선택)
     * @param page 페이지 번호 (0부터 시작, 기본값: 0)
     * @param size 페이지 크기 (기본값: 10)
     * @return 페이지네이션된 게시글 목록
     */
    @GetMapping("/posts")
    public ResponseEntity<PageResponseDTO<QAPostDTO.ListResponse>> getPostList(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("GET /api/qaboard/posts - category: {}, keyword: {}, page: {}, size: {}", 
                 category, keyword, page, size);
        
        // TODO: JWT 토큰에서 사용자 정보 추출
        // 현재는 테스트용으로 임시 값 사용
        boolean isAdmin = false; // JWT에서 역할 확인
        
        Pageable pageable = PageRequest.of(page, size);
        PageResponseDTO<QAPostDTO.ListResponse> response = 
                qaBoardService.getPostList(category, keyword, pageable, isAdmin);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 게시글 상세 조회
     * 
     * @param postId 게시글 ID
     * @return 게시글 상세 정보
     */
    @GetMapping("/posts/{postId}")
    public ResponseEntity<QAPostDTO> getPostDetail(@PathVariable Long postId) {
        log.info("GET /api/qaboard/posts/{}", postId);
        
        // TODO: JWT 토큰에서 사용자 정보 추출
        String currentUserId = "testUser"; // JWT에서 사용자 ID 추출
        boolean isAdmin = false; // JWT에서 역할 확인
        
        // 조회수 증가
        qaBoardService.incrementViewCount(postId);
        
        QAPostDTO response = qaBoardService.getPostDetail(postId, currentUserId, isAdmin);
        return ResponseEntity.ok(response);
    }

    /**
     * 게시글 작성
     * 
     * @param createRequest 게시글 작성 요청 데이터
     * @return 생성된 게시글 정보
     */
    @PostMapping("/posts")
    public ResponseEntity<QAPostDTO> createPost(@Valid @RequestBody QAPostDTO.CreateRequest createRequest) {
        log.info("POST /api/qaboard/posts - title: {}", createRequest.getTitle());
        
        // TODO: JWT 토큰에서 사용자 정보 추출
        String authorId = "testUser"; // JWT에서 사용자 ID 추출
        String authorName = "테스트사용자"; // Member 테이블에서 조회하거나 JWT에서 추출
        
        QAPostDTO response = qaBoardService.createPost(createRequest, authorId, authorName);
        return ResponseEntity.ok(response);
    }

    /**
     * 게시글 수정
     * 
     * @param postId 게시글 ID
     * @param updateRequest 게시글 수정 요청 데이터
     * @return 수정된 게시글 정보
     */
    @PutMapping("/posts/{postId}")
    public ResponseEntity<QAPostDTO> updatePost(@PathVariable Long postId,
                                               @Valid @RequestBody QAPostDTO.UpdateRequest updateRequest) {
        log.info("PUT /api/qaboard/posts/{} - title: {}", postId, updateRequest.getTitle());
        
        // TODO: JWT 토큰에서 사용자 정보 추출
        String currentUserId = "testUser"; // JWT에서 사용자 ID 추출
        boolean isAdmin = false; // JWT에서 역할 확인
        
        QAPostDTO response = qaBoardService.updatePost(postId, updateRequest, currentUserId, isAdmin);
        return ResponseEntity.ok(response);
    }

    /**
     * 게시글 삭제
     * 
     * @param postId 게시글 ID
     * @return 성공 메시지
     */
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable Long postId) {
        log.info("DELETE /api/qaboard/posts/{}", postId);
        
        // TODO: JWT 토큰에서 사용자 정보 추출
        String currentUserId = "testUser"; // JWT에서 사용자 ID 추출
        boolean isAdmin = false; // JWT에서 역할 확인
        
        qaBoardService.deletePost(postId, currentUserId, isAdmin);
        
        return ResponseEntity.ok(Map.of("message", "게시글이 성공적으로 삭제되었습니다."));
    }

    /**
     * 내가 작성한 게시글 조회 (마이페이지용)
     * 
     * @param page 페이지 번호
     * @param size 페이지 크기
     * @return 내 게시글 목록
     */
    @GetMapping("/posts/my")
    public ResponseEntity<PageResponseDTO<QAPostDTO.ListResponse>> getMyPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("GET /api/qaboard/posts/my - page: {}, size: {}", page, size);
        
        // TODO: JWT 토큰에서 사용자 정보 추출
        String authorId = "testUser"; // JWT에서 사용자 ID 추출
        
        Pageable pageable = PageRequest.of(page, size);
        PageResponseDTO<QAPostDTO.ListResponse> response = qaBoardService.getMyPosts(authorId, pageable);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 관리자 답변 작성
     * 
     * @param postId 게시글 ID
     * @param createRequest 답변 작성 요청 데이터
     * @return 생성된 답변 정보
     */
    @PostMapping("/posts/{postId}/response")
    public ResponseEntity<AdminResponseDTO> createAdminResponse(@PathVariable Long postId,
                                                               @Valid @RequestBody AdminResponseDTO.CreateRequest createRequest) {
        log.info("POST /api/qaboard/posts/{}/response", postId);
        
        // TODO: JWT 토큰에서 관리자 정보 추출 및 권한 확인
        String adminId = "admin"; // JWT에서 관리자 ID 추출
        String adminName = "관리자"; // Member 테이블에서 조회하거나 JWT에서 추출
        
        AdminResponseDTO response = adminResponseService.createResponse(postId, createRequest, adminId, adminName);
        return ResponseEntity.ok(response);
    }

    /**
     * 관리자 답변 조회
     * 
     * @param postId 게시글 ID
     * @return 답변 정보
     */
    @GetMapping("/posts/{postId}/response")
    public ResponseEntity<AdminResponseDTO> getAdminResponse(@PathVariable Long postId) {
        log.info("GET /api/qaboard/posts/{}/response", postId);
        
        AdminResponseDTO response = adminResponseService.getResponse(postId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * 관리자 답변 수정
     * 
     * @param postId 게시글 ID
     * @param updateRequest 답변 수정 요청 데이터
     * @return 수정된 답변 정보
     */
    @PutMapping("/posts/{postId}/response")
    public ResponseEntity<AdminResponseDTO> updateAdminResponse(@PathVariable Long postId,
                                                               @Valid @RequestBody AdminResponseDTO.UpdateRequest updateRequest) {
        log.info("PUT /api/qaboard/posts/{}/response", postId);
        
        // TODO: JWT 토큰에서 관리자 정보 추출 및 권한 확인
        String adminId = "admin"; // JWT에서 관리자 ID 추출
        
        AdminResponseDTO response = adminResponseService.updateResponse(postId, updateRequest, adminId);
        return ResponseEntity.ok(response);
    }

    /**
     * 관리자 답변 삭제
     * 
     * @param postId 게시글 ID
     * @return 성공 메시지
     */
    @DeleteMapping("/posts/{postId}/response")
    public ResponseEntity<Map<String, String>> deleteAdminResponse(@PathVariable Long postId) {
        log.info("DELETE /api/qaboard/posts/{}/response", postId);
        
        // TODO: JWT 토큰에서 관리자 정보 추출 및 권한 확인
        String adminId = "admin"; // JWT에서 관리자 ID 추출
        
        adminResponseService.deleteResponse(postId, adminId);
        
        return ResponseEntity.ok(Map.of("message", "답변이 성공적으로 삭제되었습니다."));
    }

    /**
     * 카테고리 목록 조회
     * 
     * @return 카테고리 목록
     */
    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, String>>> getCategories() {
        log.info("GET /api/qaboard/categories");
        
        List<Map<String, String>> categories = qaCategoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * 전역 예외 처리
     * TODO: 별도의 @ControllerAdvice 클래스로 분리 예정
     */
    // @ExceptionHandler 메서드들은 별도 클래스로 분리할 예정
}