package com.giproject.service.qaboard;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.giproject.dto.qaboard.AdminResponseDTO;
import com.giproject.dto.qaboard.PageResponseDTO;
import com.giproject.dto.qaboard.QAPostDTO;
import com.giproject.entity.qaboard.AdminResponse;
import com.giproject.entity.qaboard.QACategory;
import com.giproject.entity.qaboard.QAPost;
import com.giproject.repository.qaboard.AdminResponseRepository;
import com.giproject.repository.qaboard.QAPostRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

/**
 * QABoardService 구현체
 * 
 * QA게시판의 핵심 비즈니스 로직 처리
 * - 권한 기반 데이터 접근 제어
 * - Entity ↔ DTO 변환
 * - 비공개 게시글 처리
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class QABoardServiceImpl implements QABoardService {

    private final QAPostRepository qaPostRepository;
    private final AdminResponseRepository adminResponseRepository;

    @Override
    public QAPostDTO createPost(QAPostDTO.CreateRequest createRequest, String authorId, String authorName) {
        log.info("Creating new post by user: {}", authorId);
        
        // 카테고리 검증
        QACategory category;
        try {
            category = QACategory.fromCode(createRequest.getCategory());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 카테고리입니다: " + createRequest.getCategory());
        }
        
        // 엔티티 생성
        QAPost qaPost = QAPost.builder()
                .title(createRequest.getTitle())
                .content(createRequest.getContent())
                .category(category)
                .isPrivate(createRequest.getIsPrivate())
                .authorId(authorId)
                .authorName(authorName)
                .build();
        
        // 저장
        QAPost savedPost = qaPostRepository.save(qaPost);
        log.info("Post created successfully with ID: {}", savedPost.getPostId());
        
        return convertToDTO(savedPost, null);
    }

    @Override
    public PageResponseDTO<QAPostDTO.ListResponse> getPostList(String category, String keyword, 
                                                              Pageable pageable, boolean isAdmin) {
        log.info("Getting post list - category: {}, keyword: {}, isAdmin: {}", category, keyword, isAdmin);
        
        QACategory qaCategory = convertCategory(category);
        Page<QAPost> postPage;
        
        // 검색어와 카테고리 조합에 따른 쿼리 선택
        if (keyword != null && !keyword.trim().isEmpty()) {
            // 검색어가 있는 경우
            if (qaCategory != null) {
                // 카테고리 + 검색
                postPage = isAdmin ? 
                    qaPostRepository.searchAllPostsByCategory(qaCategory, keyword.trim(), pageable) :
                    qaPostRepository.searchPublicPostsByCategory(qaCategory, keyword.trim(), pageable);
            } else {
                // 전체 검색
                postPage = isAdmin ?
                    qaPostRepository.searchAllPosts(keyword.trim(), pageable) :
                    qaPostRepository.searchPublicPosts(keyword.trim(), pageable);
            }
        } else {
            // 검색어가 없는 경우
            if (qaCategory != null) {
                // 카테고리별 조회
                postPage = isAdmin ?
                    qaPostRepository.findByCategoryOrderByCreatedAtDesc(qaCategory, pageable) :
                    qaPostRepository.findByCategoryAndIsPrivateFalseOrderByCreatedAtDesc(qaCategory, pageable);
            } else {
                // 전체 조회
                postPage = isAdmin ?
                    qaPostRepository.findAllByOrderByCreatedAtDesc(pageable) :
                    qaPostRepository.findByIsPrivateFalseOrderByCreatedAtDesc(pageable);
            }
        }
        
        // DTO 변환
        List<QAPostDTO.ListResponse> responseList = postPage.getContent().stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
        
        return PageResponseDTO.of(postPage, responseList);
    }

    @Override
    public QAPostDTO getPostDetail(Long postId, String currentUserId, boolean isAdmin) {
        log.info("Getting post detail - postId: {}, userId: {}, isAdmin: {}", postId, currentUserId, isAdmin);
        
        // 게시글 조회 (AdminResponse와 함께)
        QAPost qaPost = qaPostRepository.findByIdWithResponse(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));
        
        // 접근 권한 확인
        if (!canViewPost(qaPost, currentUserId, isAdmin)) {
            throw new SecurityException("게시글 조회 권한이 없습니다.");
        }
        
        // 관리자 답변 조회
        AdminResponse adminResponse = adminResponseRepository.findByQaPostPostId(postId).orElse(null);
        
        return convertToDTO(qaPost, adminResponse);
    }

    @Override
    public QAPostDTO updatePost(Long postId, QAPostDTO.UpdateRequest updateRequest, 
                               String currentUserId, boolean isAdmin) {
        log.info("Updating post - postId: {}, userId: {}, isAdmin: {}", postId, currentUserId, isAdmin);
        
        // 게시글 조회
        QAPost qaPost = qaPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));
        
        // 권한 확인
        if (!hasPostPermission(qaPost, currentUserId, isAdmin)) {
            throw new SecurityException("게시글 수정 권한이 없습니다.");
        }
        
        // 카테고리 검증
        QACategory category;
        try {
            category = QACategory.fromCode(updateRequest.getCategory());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 카테고리입니다: " + updateRequest.getCategory());
        }
        
        // 게시글 업데이트
        qaPost.updatePost(updateRequest.getTitle(), updateRequest.getContent(), 
                         category, updateRequest.getIsPrivate());
        
        QAPost updatedPost = qaPostRepository.save(qaPost);
        log.info("Post updated successfully: {}", postId);
        
        // 관리자 답변 조회
        AdminResponse adminResponse = adminResponseRepository.findByQaPostPostId(postId).orElse(null);
        
        return convertToDTO(updatedPost, adminResponse);
    }

    @Override
    public void deletePost(Long postId, String currentUserId, boolean isAdmin) {
        log.info("Deleting post - postId: {}, userId: {}, isAdmin: {}", postId, currentUserId, isAdmin);
        
        // 게시글 조회
        QAPost qaPost = qaPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));
        
        // 권한 확인
        if (!hasPostPermission(qaPost, currentUserId, isAdmin)) {
            throw new SecurityException("게시글 삭제 권한이 없습니다.");
        }
        
        // 관련 답변 먼저 삭제
        adminResponseRepository.deleteByQaPostPostId(postId);
        
        // 게시글 삭제
        qaPostRepository.delete(qaPost);
        log.info("Post deleted successfully: {}", postId);
    }

    @Override
    public PageResponseDTO<QAPostDTO.ListResponse> getMyPosts(String authorId, Pageable pageable) {
        log.info("Getting my posts for user: {}", authorId);
        
        Page<QAPost> postPage = qaPostRepository.findByAuthorIdOrderByCreatedAtDesc(authorId, pageable);
        
        List<QAPostDTO.ListResponse> responseList = postPage.getContent().stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
        
        return PageResponseDTO.of(postPage, responseList);
    }

    @Override
    public void incrementViewCount(Long postId) {
        qaPostRepository.findById(postId).ifPresent(post -> {
            post.incrementViewCount();
            qaPostRepository.save(post);
        });
    }

    @Override
    public boolean hasPostPermission(Long postId, String currentUserId, boolean isAdmin) {
        if (isAdmin) {
            return true; // 관리자는 모든 권한
        }
        
        return qaPostRepository.existsByPostIdAndAuthorId(postId, currentUserId);
    }

    @Override
    public boolean canViewPost(Long postId, String currentUserId, boolean isAdmin) {
        if (isAdmin) {
            return true; // 관리자는 모든 게시글 조회 가능
        }
        
        QAPost qaPost = qaPostRepository.findById(postId).orElse(null);
        if (qaPost == null) {
            return false;
        }
        
        return canViewPost(qaPost, currentUserId, isAdmin);
    }

    /**
     * 게시글 조회 권한 확인 (내부 메서드)
     */
    private boolean canViewPost(QAPost qaPost, String currentUserId, boolean isAdmin) {
        if (isAdmin) {
            return true; // 관리자는 모든 게시글 조회 가능
        }
        
        if (qaPost.isPublic()) {
            return true; // 공개 게시글은 누구나 조회 가능
        }
        
        // 비공개 게시글은 작성자만 조회 가능
        return qaPost.isAuthor(currentUserId);
    }

    /**
     * 게시글 수정/삭제 권한 확인 (내부 메서드)
     */
    private boolean hasPostPermission(QAPost qaPost, String currentUserId, boolean isAdmin) {
        if (isAdmin) {
            return true; // 관리자는 모든 권한
        }
        
        return qaPost.isAuthor(currentUserId); // 작성자만 수정/삭제 가능
    }

    /**
     * QAPost 엔티티를 QAPostDTO로 변환
     */
    private QAPostDTO convertToDTO(QAPost qaPost, AdminResponse adminResponse) {
        AdminResponseDTO adminResponseDTO = null;
        if (adminResponse != null) {
            adminResponseDTO = AdminResponseDTO.builder()
                    .responseId(adminResponse.getResponseId())
                    .content(adminResponse.getContent())
                    .adminId(adminResponse.getAdminId())
                    .adminName(adminResponse.getAdminName())
                    .createdAt(adminResponse.getCreatedAt())
                    .updatedAt(adminResponse.getUpdatedAt())
                    .build();
        }
        
        return QAPostDTO.builder()
                .postId(qaPost.getPostId())
                .title(qaPost.getTitle())
                .content(qaPost.getContent())
                .category(qaPost.getCategory().getCode())
                .isPrivate(qaPost.getIsPrivate())
                .authorId(qaPost.getAuthorId())
                .authorName(qaPost.getAuthorName())
                .createdAt(qaPost.getCreatedAt())
                .updatedAt(qaPost.getUpdatedAt())
                .viewCount(qaPost.getViewCount())
                .hasResponse(adminResponse != null)
                .adminResponse(adminResponseDTO)
                .build();
    }

    /**
     * QAPost 엔티티를 목록용 ListResponse로 변환
     */
    private QAPostDTO.ListResponse convertToListResponse(QAPost qaPost) {
        // 답변 존재 여부 확인
        boolean hasResponse = adminResponseRepository.existsByQaPostPostId(qaPost.getPostId());
        
        return QAPostDTO.ListResponse.builder()
                .postId(qaPost.getPostId())
                .title(qaPost.getTitle())
                .category(qaPost.getCategory().getCode())
                .isPrivate(qaPost.getIsPrivate())
                .authorName(qaPost.getAuthorName())
                .createdAt(qaPost.getCreatedAt())
                .viewCount(qaPost.getViewCount())
                .hasResponse(hasResponse)
                .build();
    }
}