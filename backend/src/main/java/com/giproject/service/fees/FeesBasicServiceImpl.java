package com.giproject.service.fees;

import com.giproject.dto.fees.FeesBasicDTO;
import com.giproject.entity.fees.FeesBasic;
import com.giproject.repository.fees.FeesBasicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class FeesBasicServiceImpl implements FeesBasicService {

	private final FeesBasicRepository feesBasicRepository;

	private static final List<String> COLS = List.of("거리별 요금", "기본 요금");

	private static String trim(String s) {
		return s == null ? "" : s.trim();
	}

	@Override
	@Transactional(readOnly = true)
	public List<String> getRowNames() {
		return feesBasicRepository.findDistinctWeights().stream().filter(Objects::nonNull).map(String::trim)
				.filter(s -> !s.isEmpty()).sorted().collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<List<String>> getGrid() {
		List<String> rows = getRowNames();
		Map<String, FeesBasic> byWeight = feesBasicRepository.findAll().stream().filter(e -> e.getWeight() != null)
				.collect(Collectors.toMap(e -> e.getWeight().trim(), e -> e, (a, b) -> a));

		List<List<String>> grid = new ArrayList<>();
		for (String w : rows) {
			FeesBasic fb = byWeight.get(w);
			String perKm = (fb != null && fb.getRatePerKm() != null)
					? fb.getRatePerKm().stripTrailingZeros().toPlainString()
					: "";
			String base = (fb != null && fb.getInitialCharge() != null)
					? fb.getInitialCharge().stripTrailingZeros().toPlainString()
					: "";
			grid.add(new ArrayList<>(List.of(perKm, base)));
		}
		return grid;
	}

	@Override
	public FeesBasicDTO saveCell(String weight, String column, BigDecimal price) {
		String w = trim(weight);
		String col = trim(column);
		if (w.isEmpty() || !COLS.contains(col))
			throw new IllegalArgumentException("invalid params");

		FeesBasic fb = feesBasicRepository.findByWeight(w).orElseGet(
				() -> FeesBasic.builder().weight(w).ratePerKm(BigDecimal.ZERO).initialCharge(BigDecimal.ZERO).build());

		if ("거리별 요금".equals(col)) {
			fb.setRatePerKm(price == null ? BigDecimal.ZERO : price);
		} else {
			fb.setInitialCharge(price == null ? BigDecimal.ZERO : price);
		}
		fb.setUpdatedAt(LocalDateTime.now());
		return entityToDTO(feesBasicRepository.save(fb));
	}

	@Override
	public void addRow(String weight) {
		String w = trim(weight);
		if (w.isEmpty())
			return;
		feesBasicRepository.findByWeight(w).orElseGet(() -> feesBasicRepository.save(FeesBasic.builder().weight(w)
				.ratePerKm(BigDecimal.ZERO).initialCharge(BigDecimal.ZERO).updatedAt(LocalDateTime.now()).build()));
	}

	@Override
	public void deleteRow(String weight) {
		String w = trim(weight);
		if (w.isEmpty())
			return;
		feesBasicRepository.deleteByWeight(w);
	}

	@Override
	@Transactional(readOnly = true)
	public List<FeesBasicDTO> findAllAsDto() {
		return feesBasicRepository.findAll().stream().map(this::entityToDTO).collect(Collectors.toList());
	}

	@Override
	public Map<String, String> uploadImg(Long tno, MultipartFile file) {
		try {
			FeesBasic basic = feesBasicRepository.findById(tno)
					.orElseThrow(() -> new RuntimeException("해당 차량이 존재하지 않음" + tno));

			if (basic.getCargoImage() != null) {
				String existingImagPath = "src/main/resources/static" + basic.getCargoImage();
				Path existingPath = Paths.get(existingImagPath);
				if(Files.exists(existingPath)) {
					Files.delete(existingPath); //파일이 존재하면 지우기
					
				}
			}
			
			String fileName = UUID.randomUUID() +"_"+file.getOriginalFilename();
			Path uploadPath = Paths.get("src/main/resources/static/uploads/" + fileName);
			
			Files.createDirectories(uploadPath.getParent());
			Files.write(uploadPath, file.getBytes());
			
			basic.setCargoImage("/upload/"+fileName);
			feesBasicRepository.save(basic);
			
		} catch (Exception e) {
		    e.printStackTrace();
            return Map.of("이미지 업로드 실패" , e.getMessage());
		}
		return Map.of("이미지 업로드 성공" , "success");
	}
}