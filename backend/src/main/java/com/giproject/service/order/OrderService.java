package com.giproject.service.order;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import com.giproject.dto.order.OrderDTO;
import com.giproject.dto.order.OrderFormDTO;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.order.Order;

public interface OrderService {
	
	default OrderDTO entityToDTO(Order order) {
		OrderDTO dto = OrderDTO.builder()
				.orderNo(order.getOrderNo())
				.matchingNo(order.getMatching().getMatchingNo())
				.startRestAddress(order.getStartRestAddress())
				.endRestAddress(order.getEndRestAdrress())
				.orderUuid(order.getOrderUuid())
				.orderTime(order.getOrderTime())
				.Addressee(order.getAddressee())
				.phone(order.getPhone())
				.AddresseeEmail(order.getAddresseeEmail())
				.build();
		return dto;
	}
	default Order dtoToEntity(OrderDTO dto , Matching matching) {
		String orderCord = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm")) 
				+UUID.randomUUID().toString().substring(0, 6);
		Order order = Order.builder()
				.matching(matching)
				.orderUuid(orderCord)
				.startRestAddress(dto.getStartRestAddress())
				.endRestAdrress(dto.getEndRestAddress())
				.orderTime(LocalDateTime.now())
				.Addressee(dto.getAddressee())
				.phone(dto.getPhone())
				.AddresseeEmail(dto.getAddresseeEmail())
				.build();
		return order;
	}
	
	public OrderFormDTO loadOrderForm(Long matchingNo);
}
