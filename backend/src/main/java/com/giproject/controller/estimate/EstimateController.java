package com.giproject.controller.estimate;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.dto.fees.FeesBasicDTO;
import com.giproject.dto.fees.FeesExtraDTO;
import com.giproject.dto.matching.MatchingDTO;
import com.giproject.dto.matching.PageRequestDTO;
import com.giproject.dto.matching.PageResponseDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.service.estimate.EstimateService;
import com.giproject.service.estimate.matching.MatchingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/g2i4/estimate")
public class EstimateController {

	private final EstimateService estimateService;
	private final MatchingService matchingService;
	private final CargoOwnerRepository cargoOwnerRepository;

	@PostMapping("/")
	public Map<String, Long> register(@RequestBody EstimateDTO dto) {
		// Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		// String memId = auth.getName();
		dto.setMemberId("user");

		Long eno = estimateService.sendEstimate(dto);
		log.info("Received DTO: {}", eno);
		return Map.of("RESULT", eno);

	}

	@GetMapping("/list")
	public PageResponseDTO<MatchingDTO> getEstimateList(PageRequestDTO dto) {
		return matchingService.getList(dto);
	}

	@PostMapping("/rejected")
	public ResponseEntity<Map<String, String>> reject(@RequestBody Map<String, Long> eno) {
		Long estimateNo = eno.get("estimateNo");

		CargoOwner cargoOwner = cargoOwnerRepository.findById("cargo123").get();

		matchingService.rejectMatching(estimateNo, cargoOwner);

		return ResponseEntity.ok().body(Map.of("result", "reject"));
	}

	@PostMapping("/accepted")
	public ResponseEntity<Map<String, String>> accepted(@RequestBody Map<String, Long> eno) {
		Long estimateNo = eno.get("estimateNo");
		CargoOwner cargoOwner = cargoOwnerRepository.findById("cargo123").get();

		matchingService.acceptMatching(estimateNo, cargoOwner);

		return ResponseEntity.ok().body(Map.of("result", "accepted"));
	}

	@GetMapping("savelist")
	public ResponseEntity<List<EstimateDTO>> getSaveEstimat() {
		// Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		// String memId = auth.getName(); 추후 아이디 토큰인증로 확인예정
		String user = "user";
		List<EstimateDTO> dtolist = estimateService.getSaveEstimate(user);

		return ResponseEntity.ok(dtolist);

	}

	@GetMapping("/export")
	public ResponseEntity<EstimateDTO> exportEs(@RequestParam("eno") Long eno) {
		// Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		// String memId = auth.getName(); 추후 아이디 토큰인증로 확인예정
		String user = "user";
		EstimateDTO dto = estimateService.exportEstimate(user, eno);
		return ResponseEntity.ok(dto);
	}

	@PostMapping("savedreft")
	public ResponseEntity<Map<String, String>>  saveEstimate(@RequestBody EstimateDTO estimateDTO) {
		estimateDTO.setMemberId("user");
		try {
			Long eno = estimateService.saveDraft(estimateDTO);
			String streno = String.valueOf(eno);
			return ResponseEntity.ok(Map.of("succese",streno));
		} catch (IllegalStateException e) {
			// 임시저장 초과 등 사용자 오류
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		} catch (NoSuchElementException e) {
			// memberId가 잘못되었을 때
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "해당 사용자가 존재하지 않습니다."));
		} catch (Exception e) {
			// 기타 예외
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "서버 오류가 발생했습니다."));
		}

	}
	
	@PostMapping("myestimate")
	public ResponseEntity<List<EstimateDTO>> getMyEs(@RequestBody Map<String, String> body){
		//String memberId = body.get("memberId");
		String user = "user";
		List<EstimateDTO> dtoList = estimateService.myEstimateList(user);
		
		return ResponseEntity.ok(dtoList);
	}
	@GetMapping("/my-all-list")
	public ResponseEntity<List<EstimateDTO>> getMyAllEstimateList() {
	    // 추후 인증 기반으로 수정 예정
	    String user = "user";

	    List<EstimateDTO> dtoList = estimateService.myEstimateList(user);

	    return ResponseEntity.ok(dtoList);
	}
	@GetMapping("/unpaidlist")
	public ResponseEntity<List<EstimateDTO>> getMyUnpaidEstimateList() {
	    // TODO: 인증 연동 시 SecurityContext에서 user 추출
	    String user = "user";
	    List<EstimateDTO> dtoList = estimateService.findMyEstimatesWithoutPayment(user);
	    return ResponseEntity.ok(dtoList);
	}
	@PostMapping("/searchfeesbasic")
	public ResponseEntity<List<FeesBasicDTO>> getFeesBasic(){
		System.out.println(estimateService.searchFees());
		return ResponseEntity.ok(estimateService.searchFees());
	}
	
	@PostMapping("searchfeesextra")
	public ResponseEntity<List<FeesExtraDTO>> getFeesExtra(){
		return ResponseEntity.ok(estimateService.searchExtra());
	}
	
}
