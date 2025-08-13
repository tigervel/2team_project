package com.giproject.service.fees;

import com.giproject.entity.fees.FeesExtra;
import com.giproject.repository.fees.FeesExtraRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class FeesExtraServiceImpl implements FeesExtraService {

    private final FeesExtraRepository feesExtraRepository;

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllTitles() {
        return feesExtraRepository.findAll()
                .stream()
                .map(FeesExtra::getExtraChargeTitle)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<List<String>> getFeeGrid() {
        List<String> titles = getAllTitles();
        String col = "추가요금";

        Map<String, BigDecimal> map = feesExtraRepository.findAll().stream()
                .filter(f -> f.getExtraChargeTitle() != null)
                .collect(Collectors.toMap(
                        f -> f.getExtraChargeTitle().trim(),
                        FeesExtra::getExtraCharge,
                        (a, b) -> b
                ));

        List<List<String>> grid = new ArrayList<>();
        for (String t : titles) {
            BigDecimal price = map.get(t);
            String cell = (price == null) ? "" : price.stripTrailingZeros().toPlainString();
            grid.add(new ArrayList<>(List.of(cell)));
        }
        return grid;
    }

    @Override
    @Transactional
    public void saveOrUpdate(String title, String distance, BigDecimal price) {
        String key = trim(title);
        if (key.isEmpty()) throw new IllegalArgumentException("title is blank");

        FeesExtra row = feesExtraRepository.findByExtraChargeTitle(key)
                .orElseGet(() -> FeesExtra.builder()
                        .extraChargeTitle(key)
                        .extraCharge(BigDecimal.ZERO)
                        .build());

        row.setExtraCharge(price == null ? BigDecimal.ZERO : price);
        row.setUpdatedAt(LocalDateTime.now());
        feesExtraRepository.save(row);
    }

    @Override
    @Transactional
    public void addTitle(String title) {
        String key = trim(title);
        if (key.isEmpty()) throw new IllegalArgumentException("title is blank");

        feesExtraRepository.findByExtraChargeTitle(key).orElseGet(() -> {
            FeesExtra fe = FeesExtra.builder()
                    .extraChargeTitle(key)
                    .extraCharge(BigDecimal.ZERO)
                    .updatedAt(LocalDateTime.now())
                    .build();
            return feesExtraRepository.save(fe);
        });
    }

    @Override
    @Transactional
    public void deleteTitle(String title) {
        String key = trim(title);
        if (key.isEmpty()) return;
        feesExtraRepository.deleteByExtraChargeTitle(key);
    }

    private static String trim(String s) { return s == null ? "" : s.trim(); }
}