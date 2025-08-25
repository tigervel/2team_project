package com.giproject.service.report;

import com.giproject.dto.report.UserReportDTO;
import com.giproject.entity.report.UserReport;
import com.giproject.repository.report.UserReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional(readOnly = true)
public class UserReportServiceImpl implements UserReportService {

    private final UserReportRepository repo;

    @Override
    public long countUnread() {
        return repo.countByAdminReadFalse();
    }

    @Override
    public Page<UserReportDTO> list(Boolean unreadOnly, String keyword, Pageable pageable) {
        Page<UserReport> page;

        if (Boolean.TRUE.equals(unreadOnly)) {
            page = (keyword == null || keyword.isBlank())
                    ? repo.findByAdminRead(false, pageable)
                    : repo.findByReporterIdContainingIgnoreCaseOrTargetIdContainingIgnoreCaseOrContentContainingIgnoreCase(
                        keyword, keyword, keyword, pageable
                    ).map(r -> r);
        } else {
            if (keyword == null || keyword.isBlank()) {
                page = repo.findAll(pageable);
            } else {
                page = repo.findByReporterIdContainingIgnoreCaseOrTargetIdContainingIgnoreCaseOrContentContainingIgnoreCase(
                        keyword, keyword, keyword, pageable
                );
            }
        }

        return page.map(this::entityToDto);
    }

    @Override
    @Transactional
    public UserReportDTO markRead(Long id, boolean read) {
        UserReport r = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Report not found: " + id));
        r = UserReport.builder()
                .id(r.getId())
                .reporterId(r.getReporterId())
                .targetId(r.getTargetId())
                .content(r.getContent())
                .createdAt(r.getCreatedAt())
                .adminRead(read)
                .build();
        r = repo.save(r);
        return entityToDto(r);
    }

    @Override
    @Transactional
    public int markAllRead() {
        int updated = 0;
        for (UserReport r : repo.findAll()) {
            if (!r.isAdminRead()) {
                UserReport saved = UserReport.builder()
                        .id(r.getId())
                        .reporterId(r.getReporterId())
                        .targetId(r.getTargetId())
                        .content(r.getContent())
                        .createdAt(r.getCreatedAt())
                        .adminRead(true)
                        .build();
                repo.save(saved);
                updated++;
            }
        }
        return updated;
    }

    @Override
    @Transactional
    public UserReportDTO create(UserReportDTO dto) {
        UserReport entity = dtoToEntity(dto);
        if (entity.getCreatedAt() == null) {
            entity = UserReport.builder()
                    .id(entity.getId())
                    .reporterId(entity.getReporterId())
                    .targetId(entity.getTargetId())
                    .content(entity.getContent())
                    .createdAt(LocalDateTime.now())
                    .adminRead(false)
                    .build();
        }
        return entityToDto(repo.save(entity));
    }
}
