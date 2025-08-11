package com.giproject.service.order;

import org.springframework.stereotype.Service;

import com.giproject.dto.order.OrderFormDTO;
import com.giproject.dto.order.OrderSheetDTO;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.member.Member;
import com.giproject.entity.order.OrderSheet;
import com.giproject.repository.matching.MatchingRepository;
import com.giproject.repository.order.OrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService{
	
	private final OrderRepository orderRepository;
	private final MatchingRepository matchingRepository;
	 
	@Override
	public OrderFormDTO loadOrderForm(Long matchingNo) {
		Matching matching =matchingRepository.findById(matchingNo).orElseThrow();
		Estimate estimate = matching.getEstimate();
		Member member = estimate.getMember();
		
		
		return OrderFormDTO.builder()
				.ordererName(member.getMemName())
				.ordererPhone(member.getMemPhone())
				.ordererEmail(member.getMemEmail())
				.startAddress(estimate.getStartAddress())
				.endAddress(estimate.getEndAddress())
				.baseCost(estimate.getBaseCost())
				.distanceCost(estimate.getDistanceCost())
				.specialOptionCost(estimate.getSpecialOption())
				.totalCost(estimate.getTotalCost())
				.matchingNo(matchingNo)
				.build();
				
	}

	@Override
	public OrderSheet placeOrderFromPayment(OrderSheetDTO dto) {
		Matching matching= matchingRepository.findById(dto.getMatchingNo()).orElseThrow();
		OrderSheet sheet = dtoToEntity(dto, matching);
		orderRepository.save(sheet);
		return sheet;
	}

}
