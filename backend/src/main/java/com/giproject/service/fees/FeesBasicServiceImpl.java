package com.giproject.service.fees;

import com.giproject.entity.fees.FeesBasic;
import com.giproject.repository.fees.FeesBasicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class FeesBasicServiceImpl implements FeesBasicService {

    private final FeesBasicRepository feesBasicRepository;

    @Override
    public List<String> getAllWeights() {
        return feesBasicRepository.findAll()
                .stream()
                .map(FeesBasic::getWeight)
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public List<List<String>> getFeeGrid() {
        List<String> weights = getAllWeights();
        String[] cols = {"거리별 요금", "기본 요금"};

        Map<String, BigDecimal> priceMap = feesBasicRepository.findAll().stream()
                .collect(Collectors.toMap(
                        f -> f.getWeight() + "||" + (f.getRatePerKm() != null ? "거리별 요금" : "기본 요금"),
                        f -> f.getRatePerKm() != null ? f.getRatePerKm() : f.getInitialCharge()
                ));

        List<List<String>> grid = new ArrayList<>();
        for (String w : weights) {
            List<String> row = new ArrayList<>();
            for (String col : cols) {
                BigDecimal val = priceMap.get(w + "||" + col);
                row.add(val != null ? val.stripTrailingZeros().toPlainString() : "");
            }
            grid.add(row);
        }
        return grid;
    }

    @Override
    public void saveOrUpdate(String weight, String distance, BigDecimal price) {
        FeesBasic fee;
        if ("거리별 요금".equals(distance)) {
            fee = feesBasicRepository.findByWeight(weight)
                    .orElse(FeesBasic.builder().weight(weight).build());
            fee.setRatePerKm(price);
        } else {
            fee = feesBasicRepository.findByWeight(weight)
                    .orElse(FeesBasic.builder().weight(weight).build());
            fee.setInitialCharge(price);
        }
        fee.setUpdatedAt(LocalDateTime.now());
        feesBasicRepository.save(fee);
    }

    @Override
    public void addWeight(String weight) {
        FeesBasic fee = FeesBasic.builder()
                .weight(weight)
                .ratePerKm(BigDecimal.ZERO)
                .initialCharge(BigDecimal.ZERO)
                .updatedAt(LocalDateTime.now())
                .build();
        feesBasicRepository.save(fee);
    }

    @Override
    public void deleteWeight(String weight) {
        feesBasicRepository.deleteByWeight(weight);
    }
}