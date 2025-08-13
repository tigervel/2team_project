package com.giproject.controller.fees;

import com.giproject.entity.fees.FeesBasic;
import com.giproject.entity.fees.FeesExtra;
import com.giproject.repository.fees.FeesBasicRepository;
import com.giproject.repository.fees.FeesExtraRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/fees")
public class FeesAdminController {

	private final FeesBasicRepository feesBasicRepository;
	private final FeesExtraRepository feesExtraRepository;

	// 기본 템플릿
	private static final List<String> BASIC_ROWS_DEFAULT = List.of("0.5톤", "1톤", "2톤", "3톤", "4톤", "5톤이상");
	private static final List<String> BASIC_COLS = List.of("거리별 요금", "기본 요금");

	private static final List<String> EXTRA_ROWS_DEFAULT = List.of("냉동식품", "유제품", "위험물", "파손주의");
	private static final List<String> EXTRA_COLS = List.of("추가요금");

	// ---------- 행 목록 조회 ----------
	@GetMapping("/basic/rows")
	public List<String> getBasicRows() {
		List<String> fromDb = feesBasicRepository.findDistinctWeights();
		// 기본 + DB → 중복제거 + 정렬
		return mergedDistinct(BASIC_ROWS_DEFAULT, fromDb);
	}

	@GetMapping("/extra/rows")
	public List<String> getExtraRows() {
		List<String> fromDb = feesExtraRepository.findDistinctTitles();
		return mergedDistinct(EXTRA_ROWS_DEFAULT, fromDb);
	}

	// ---------- 행 추가 ----------
	@PostMapping("/basic/rows")
	@Transactional
	public ResponseEntity<Void> addBasicRow(@RequestBody RowRequest req) {
		String weight = trim(req.getName());
		if (weight.isEmpty())
			return ResponseEntity.badRequest().build();

		boolean exists = feesBasicRepository.findByWeight(weight).isPresent();
		if (!exists) {
			FeesBasic fb = FeesBasic.builder().weight(weight).ratePerKm(BigDecimal.ZERO).initialCharge(BigDecimal.ZERO)
					.updatedAt(LocalDateTime.now()).build();
			feesBasicRepository.save(fb);
		}
		return ResponseEntity.ok().build();
	}

	@PostMapping("/extra/rows")
	@Transactional
	public ResponseEntity<Void> addExtraRow(@RequestBody RowRequest req) {
		String title = trim(req.getName());
		if (title.isEmpty())
			return ResponseEntity.badRequest().build();

		boolean exists = feesExtraRepository.findByExtraChargeTitle(title).isPresent();
		if (!exists) {
			FeesExtra fe = FeesExtra.builder().extraChargeTitle(title).extraCharge(BigDecimal.ZERO)
					.updatedAt(LocalDateTime.now()).build();
			feesExtraRepository.save(fe);
		}
		return ResponseEntity.ok().build();
	}

	// ---------- 행 삭제 ----------
	@DeleteMapping("/basic/rows/{weight}")
	@Transactional
	public ResponseEntity<Void> deleteBasicRow(@PathVariable String weight) {
		String key = weight == null ? "" : weight.trim();
		if (key.isEmpty())
			return ResponseEntity.badRequest().build();

		feesBasicRepository.findByWeight(key).ifPresent(feesBasicRepository::delete);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/extra/rows/{title}")
	@Transactional
	public ResponseEntity<Void> deleteExtraRow(@PathVariable String title) {
		String key = trim(title);
		if (key.isEmpty())
			return ResponseEntity.badRequest().build();

		feesExtraRepository.findByExtraChargeTitle(key).ifPresent(feesExtraRepository::delete);
		return ResponseEntity.noContent().build();
	}

	// ---------- 그리드 조회 ----------
	@GetMapping("/basic")
	public ResponseEntity<List<List<String>>> getBasic() {
		List<String> rows = getBasicRows();
		List<List<String>> grid = blankGrid(rows.size(), BASIC_COLS.size());

		Map<String, FeesBasic> byWeight = new HashMap<>();
		for (FeesBasic fb : feesBasicRepository.findAll()) {
			byWeight.put(trim(fb.getWeight()), fb);
		}

		for (int r = 0; r < rows.size(); r++) {
			String weight = trim(rows.get(r));
			FeesBasic fb = byWeight.get(weight);
			String ratePerKm = fb != null && fb.getRatePerKm() != null
					? fb.getRatePerKm().stripTrailingZeros().toPlainString()
					: "";
			String initialCharge = fb != null && fb.getInitialCharge() != null
					? fb.getInitialCharge().stripTrailingZeros().toPlainString()
					: "";

			grid.get(r).set(0, ratePerKm);
			grid.get(r).set(1, initialCharge);
		}
		return ResponseEntity.ok(grid);
	}

	@GetMapping("/extra")
	public ResponseEntity<List<List<String>>> getExtra() {
		List<String> rows = getExtraRows();
		List<List<String>> grid = blankGrid(rows.size(), EXTRA_COLS.size());

		Map<String, FeesExtra> byTitle = new HashMap<>();
		for (FeesExtra fe : feesExtraRepository.findAll()) {
			byTitle.put(trim(fe.getExtraChargeTitle()), fe);
		}

		for (int r = 0; r < rows.size(); r++) {
			String title = trim(rows.get(r));
			FeesExtra fe = byTitle.get(title);
			String extra = fe != null && fe.getExtraCharge() != null
					? fe.getExtraCharge().stripTrailingZeros().toPlainString()
					: "";
			grid.get(r).set(0, extra);
		}
		return ResponseEntity.ok(grid);
	}

	// ---------- 셀 저장 ----------
	@PostMapping("/basic")
	@Transactional
	public ResponseEntity<Void> upsertBasic(@RequestBody SaveRequest req) {
		String weight = trim(req.getCategory());
		String column = trim(req.getDistance());
		long price = req.getPrice();

		if (weight.isEmpty() || !BASIC_COLS.contains(column) || price < 0)
			return ResponseEntity.badRequest().build();

		FeesBasic row = feesBasicRepository.findByWeight(weight).orElseGet(() -> FeesBasic.builder().weight(weight)
				.ratePerKm(BigDecimal.ZERO).initialCharge(BigDecimal.ZERO).build());

		if ("거리별 요금".equals(column))
			row.setRatePerKm(BigDecimal.valueOf(price));
		else
			row.setInitialCharge(BigDecimal.valueOf(price));

		row.setUpdatedAt(LocalDateTime.now());
		feesBasicRepository.save(row);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/extra")
	@Transactional
	public ResponseEntity<Void> upsertExtra(@RequestBody SaveRequest req) {
		String title = trim(req.getCategory());
		String col = trim(req.getDistance());
		long price = req.getPrice();

		if (title.isEmpty() || !EXTRA_COLS.contains(col) || price < 0)
			return ResponseEntity.badRequest().build();

		FeesExtra row = feesExtraRepository.findByExtraChargeTitle(title)
				.orElseGet(() -> FeesExtra.builder().extraChargeTitle(title).extraCharge(BigDecimal.ZERO).build());
		row.setExtraCharge(BigDecimal.valueOf(price));
		row.setUpdatedAt(LocalDateTime.now());
		feesExtraRepository.save(row);
		return ResponseEntity.ok().build();
	}

	// ----- utils -----
	private static List<List<String>> blankGrid(int r, int c) {
		List<List<String>> grid = new ArrayList<>();
		for (int i = 0; i < r; i++)
			grid.add(new ArrayList<>(Collections.nCopies(c, "")));
		return grid;
	}

	private static String trim(String s) {
		return s == null ? "" : s.trim();
	}

	private static List<String> mergedDistinct(List<String> defaults, List<String> fromDb) {
		LinkedHashSet<String> set = new LinkedHashSet<>();
		defaults.forEach(s -> set.add(trim(s)));
		fromDb.forEach(s -> {
			String t = trim(s);
			if (!t.isEmpty())
				set.add(t);
		});
		return new ArrayList<>(set);
	}

	@Getter
	@Setter
	public static class SaveRequest {
		private String category; // (기본) 중량, (추가) 항목명
		private String distance; // "거리별 요금" | "기본 요금" | "추가요금"
		private long price; // 금액(정수)
	}

	@Getter
	@Setter
	public static class RowRequest {
		private String name; // 추가 or 삭제할 행 라벨
	}
}