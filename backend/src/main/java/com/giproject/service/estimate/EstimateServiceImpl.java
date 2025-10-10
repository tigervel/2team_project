package com.giproject.service.estimate;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.dto.fees.FeesBasicDTO;
import com.giproject.dto.fees.FeesExtraDTO;
import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.fees.FeesBasic;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.member.Member;
import com.giproject.entity.order.OrderSheet;
import com.giproject.entity.payment.Payment;
import com.giproject.repository.delivery.DeliveryRepository;
import com.giproject.repository.estimate.EsmateRepository;
import com.giproject.repository.fees.FeesBasicRepository;
import com.giproject.repository.fees.FeesExtraRepository;
import com.giproject.repository.matching.MatchingRepository;
import com.giproject.service.estimate.matching.MatchingService;
import com.giproject.service.fees.FeesBasicService;
import com.giproject.service.fees.FeesExtraService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2

public class EstimateServiceImpl implements EstimateService{
	private final EsmateRepository esmateRepository;
	private final MatchingRepository matchingRepository;
	private final FeesBasicRepository basicRepository;
	private final FeesBasicService basicService;
	private final FeesExtraRepository extraRepository;
	private final FeesExtraService extraService;

    private final DeliveryRepository deliveryRepository;
	
	@Override
	public Long sendEstimate(EstimateDTO dto) {
		
		
		
		Member member= esmateRepository.getMemId(dto.getMemberId()).orElseThrow();
		Estimate estimate= DTOToEntity(dto,member);
		
		esmateRepository.save(estimate);
		estimate.changeIsTemp(false);
		Matching matching = Matching.builder()
				.estimate(estimate)
				.isAccepted(false)
				.build();
		matchingRepository.save(matching);
				return estimate.getEno();
	}
	@Override
	public Long saveDraft(EstimateDTO estimateDTO) {
		
		Member member = esmateRepository.getMemId(estimateDTO.getMemberId()).orElseThrow();
		int count = esmateRepository.estimateCount(member.getMemId()); //임시저장 갯수 확인
		
		if(count>=3) {
			throw new IllegalStateException("임시저장은 최대 3개까지 가능합니다.");
		}
		estimateDTO.setTemp(true);
		Estimate estimate= DTOToEntity(estimateDTO, member);
		
		esmateRepository.save(estimate);
		return estimate.getEno();
	}


	@Override
	public List<EstimateDTO> getSaveEstimate(String memberId) {
		List<Estimate> tempEstimate = esmateRepository.saveEstimateList(memberId);
		
		return tempEstimate.stream()
				.map(this::entityToDTO)
				.collect(Collectors.toList());
	}

	@Override
	public EstimateDTO exportEstimate(String mameberId, Long eno) {
		Estimate estimate = esmateRepository.exportEs(mameberId, eno);
		EstimateDTO dto = entityToDTO(estimate);
		return dto;
		
	}

	@Override
	public List<EstimateDTO> myEstimateList(String memberId) {
	    List<Estimate> esList = esmateRepository.getMyEstimate(memberId);
	    log.info("myEstimateList() 진입 - 조회 결과 수: {}", esList.size());

	    return esList.stream().map(estimate -> {
	        if (estimate.getMember() == null) {
	            log.warn("estimate {} 의 member가 null입니다", estimate.getEno());
	        }

	        EstimateDTO dto = entityToDTO(estimate);

	        // matching 여부 조회
	        Optional<Boolean> isAcceptedOpt = matchingRepository.findIsAcceptedByEstimateNo(estimate.getEno());
	        dto.setAccepted(isAcceptedOpt.orElse(false)); // null이면 false 처리

	        log.info("DTO 변환 성공: {} (isAccepted: {})", dto.getEno(), dto.isAccepted());
	        Optional<Long> matchingNoOpt = matchingRepository.findMatchingNoByEstimateNo(estimate.getEno());
	        dto.setMatchingNo(matchingNoOpt.orElse(null));
	        
	        return dto;
	    }).collect(Collectors.toList());
	}
	@Override
	public List<FeesBasicDTO> searchFees() {
		return basicRepository.findAllAsc()
				.stream()
				.map(list -> basicService.entityToDTO(list))
				.collect(Collectors.toList());
	}
	@Override
	public List<FeesExtraDTO> searchExtra() {
		return extraRepository.findAll()
				.stream()
				.map(list -> extraService.entityToDTO(list))
				.collect(Collectors.toList());
	}
	
	@Override
	public List<EstimateDTO> findMyEstimatesWithoutPayment(String memberId) {
	    List<Estimate> estimates = esmateRepository.findMyEstimatesWithoutPayment(memberId);
	    log.info("myEstimateList() 진입 - (결제 없는) 조회 결과 수: {}", estimates.size());

	    return estimates.stream()
	        .filter(e -> !e.isTemp())
	        .map(e -> {
	            EstimateDTO dto = entityToDTO(e);
	            Matching matching = pickMatching(e);
	            if (matching != null) {
	                dto.setAccepted(matching.isAccepted());
	                dto.setMatchingNo(matching.getMatchingNo());
	                if (matching.getCargoOwner() != null) {
	                    dto.setDriverName(matching.getCargoOwner().getCargoName());
	                }
	            }
	            return dto;
	        })
	        .collect(Collectors.toList());
	}

	@Override
	public List<EstimateDTO> findMyPaidEstimates(String memberId) {
	    List<Estimate> estimates = esmateRepository.findMyPaidEstimates(memberId);

	    List<Long> paymentNos = estimates.stream()
	        .flatMap(e -> e.getMatchings().stream())
	        .map(Matching::getOrderSheet)
	        .filter(Objects::nonNull)
	        .map(OrderSheet::getPayment)
	        .filter(Objects::nonNull)
	        .map(Payment::getPaymentNo)
	        .filter(Objects::nonNull)
	        .distinct()
	        .toList();

	    Map<Long, Delivery> deliveryByPayment = paymentNos.isEmpty()
	        ? Map.of()
	        : deliveryRepository.findAllByPaymentNoIn(paymentNos).stream()
	            .filter(d -> d.getPayment() != null && d.getPayment().getPaymentNo() != null)
	            .collect(Collectors.toMap(
	                d -> d.getPayment().getPaymentNo(),
	                d -> d,
	                (left, right) -> left
	            ));

	    return estimates.stream()
	        .filter(e -> !e.isTemp())
	        .map(e -> {
	            EstimateDTO dto = entityToDTO(e);
	            Matching matching = pickMatching(e);
	            if (matching != null) {
	                dto.setAccepted(matching.isAccepted());
	                dto.setMatchingNo(matching.getMatchingNo());
	                if (matching.getCargoOwner() != null) {
	                    dto.setDriverName(matching.getCargoOwner().getCargoName());
	                }
	                OrderSheet orderSheet = matching.getOrderSheet();
	                if (orderSheet != null && orderSheet.getPayment() != null) {
	                    Payment payment = orderSheet.getPayment();
	                    dto.setPaymentNo(payment.getPaymentNo());
	                    Delivery delivery = deliveryByPayment.get(payment.getPaymentNo());
	                    if (delivery != null) {
	                        dto.setDeliveryStatus(delivery.getStatus());
	                        dto.setDeliveryCompletedAt(delivery.getCompletTime());
	                    }
	                }
	            }
	            return dto;
	        })
	        .collect(Collectors.toList());
	}

	private Matching pickMatching(Estimate estimate) {
	    return estimate.getMatchings().stream()
	        .sorted(Comparator
	            .comparing(Matching::isAccepted).reversed()
	            .thenComparing(Matching::getMatchingNo, Comparator.nullsLast(Comparator.reverseOrder())))
	        .findFirst()
	        .orElse(null);
	}
}
