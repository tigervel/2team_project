package com.giproject.service.noboard;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.giproject.dto.noboard.NoticeDTO;
import com.giproject.dto.noboard.NoticePageResponseDTO;
import com.giproject.entity.noboard.Notice;
import com.giproject.repository.noboard.NoticeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

/**
 * NoticeService 구현체
 * 
 * 공지사항의 핵심 비즈니스 로직 처리
 * - 관리자 권한 기반 데이터 접근 제어
 * - Entity ↔ DTO 변환
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class NoticeServiceImpl implements NoticeService {

    private final NoticeRepository noticeRepository;

    @Transactional
    @Override
    public NoticeDTO createNotice(NoticeDTO.CreateRequest createRequest, String authorId, String authorName) {
        log.info("Creating new notice by admin: {}", authorId);
        
        // URL 인코딩된 관리자명 디코딩 처리
        try {
            authorName = java.net.URLDecoder.decode(authorName, "UTF-8");
        } catch (Exception e) {
            log.warn("Failed to decode author name: {}", authorName);
        }
        
        // 엔티티 생성
        Notice notice = Notice.builder()
                .title(createRequest.getTitle())
                .content(createRequest.getContent())
                .authorId(authorId)
                .authorName(authorName)
                .build();
        
        // 저장
        Notice savedNotice = noticeRepository.save(notice);
        log.info("Notice created successfully with ID: {}", savedNotice.getNoticeId());
        
        return convertToDTO(savedNotice);
    }

    @Transactional(readOnly = true)
    @Override
    public NoticePageResponseDTO<NoticeDTO.ListResponse> getNoticeList(String keyword, Pageable pageable) {
        log.info("Getting notice list - keyword: {}, pageable: {}", keyword, pageable);
        
        Page<Notice> noticePage;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            noticePage = noticeRepository.findByTitleContainingOrContentContainingOrderByCreatedAtDesc(keyword.trim(), pageable);
        } else {
            noticePage = noticeRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        
        // DTO 변환
        List<NoticeDTO.ListResponse> responseList = noticePage.getContent().stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
        
        return NoticePageResponseDTO.of(noticePage, responseList);
    }

    @Transactional
    @Override
    public NoticeDTO getNoticeDetail(Long noticeId) {
        log.info("Getting notice detail - noticeId: {}", noticeId);
        
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다: " + noticeId));
        
        // 조회수 증가
        notice.incrementViewCount();
        noticeRepository.save(notice); // 변경사항 저장
        
        return convertToDTO(notice);
    }

    @Transactional
    @Override
    public NoticeDTO updateNotice(Long noticeId, NoticeDTO.UpdateRequest updateRequest, String currentUserId, String authorName, boolean isAdmin) {
        log.info("=== NoticeService.updateNotice 시작 ===");
        log.info("파라미터 확인 - noticeId: {}, currentUserId: {}, authorName: '{}', isAdmin: {}", noticeId, currentUserId, authorName, isAdmin);
        log.info("updateRequest 내용 - title: '{}', content: '{}'", updateRequest.getTitle(), updateRequest.getContent());
        
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다: " + noticeId));
        
        // 권한 확인 (관리자 또는 작성자 본인)
        if (!isAdmin && !notice.getAuthorId().equals(currentUserId)) {
            throw new SecurityException("공지사항 수정 권한이 없습니다. 관리자이거나 작성자 본인이어야 합니다.");
        }
        
        log.info("수정 전 기존 데이터 - authorId: {}, authorName: '{}'", notice.getAuthorId(), notice.getAuthorName());
        
        // 공지사항 업데이트 (제목, 내용, 작성자명 포함)
        log.info("updateNotice 메서드 호출 - title: '{}', content: '{}', authorName: '{}'", 
                updateRequest.getTitle(), updateRequest.getContent(), authorName);
        notice.updateNotice(updateRequest.getTitle(), updateRequest.getContent(), authorName);
        
        log.info("수정 후 데이터 - authorId: {}, authorName: '{}'", notice.getAuthorId(), notice.getAuthorName());
        
        Notice updatedNotice = noticeRepository.save(notice);
        log.info("Notice updated successfully: {}", noticeId);
        log.info("=== NoticeService.updateNotice 완료 ===");
        
        return convertToDTO(updatedNotice);
    }

    @Transactional
    @Override
    public void deleteNotice(Long noticeId, String currentUserId, boolean isAdmin) {
        log.info("Deleting notice - noticeId: {} by user: {}, isAdmin: {}", noticeId, currentUserId, isAdmin);
        
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다: " + noticeId));
        
        // 권한 확인 (관리자 또는 작성자 본인)
        if (!isAdmin && !notice.getAuthorId().equals(currentUserId)) {
            throw new SecurityException("공지사항 삭제 권한이 없습니다. 관리자이거나 작성자 본인이어야 합니다.");
        }
        
        try {
            noticeRepository.delete(notice);
            log.info("Notice deleted successfully: {}", noticeId);
        } catch (Exception e) {
            log.error("Error deleting notice {}: {}", noticeId, e.getMessage());
            throw new RuntimeException("공지사항 삭제 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    @Transactional
    @Override
    public void incrementViewCount(Long noticeId) {
        noticeRepository.findById(noticeId).ifPresent(notice -> {
            notice.incrementViewCount();
            noticeRepository.save(notice);
        });
    }
}