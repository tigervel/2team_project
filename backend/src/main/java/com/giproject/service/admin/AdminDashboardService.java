package com.giproject.service.admin;

import java.util.ArrayList;

import com.giproject.dto.admin.DashboardDataDTO;
import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.dto.member.MemberDTO;
import com.giproject.dto.order.OrderSheetDTO;
import com.giproject.dto.payment.PaymentDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.entity.payment.Payment;
import com.giproject.entity.order.OrderSheet;

import jakarta.transaction.Transactional;

@Transactional
public interface AdminDashboardService {

	DashboardDataDTO dashboardDataDTO();
	
	default MemberDTO entityToDTO(Member member) {
        return new MemberDTO(//MemberDTO랑 CargoOwnerDTO에 빌더가 없어서 빌더 빼고 작성
                member.getMemId(),
                member.getMemPw(),
                member.getMemEmail(),
                member.getMemName(),
                member.getMemPhone(),
                member.getMemAddress(),
                member.getMemCreateIdDateTime(),
                new ArrayList<>()
        );
    }
    
	default CargoOwnerDTO entityToDTO(CargoOwner cargoOwner) {
        return new CargoOwnerDTO(
        		cargoOwner.getCargoId(),
                cargoOwner.getCargoPw(),
                cargoOwner.getCargoEmail(),
                cargoOwner.getCargoName(),
                cargoOwner.getCargoPhone(),
                cargoOwner.getCargoAddress(),
                cargoOwner.getCargoCreatedDateTime(),
                new ArrayList<>()
                );
    }
	
	default OrderSheetDTO entityToDTO(OrderSheet orderSheet) {
        return OrderSheetDTO.builder()
                .orderNo(orderSheet.getOrderNo())
                .matchingNo(orderSheet.getMatching().getMatchingNo())
                .orderUuid(orderSheet.getOrderUuid())
                .startRestAddress(orderSheet.getStartRestAddress())
                .endRestAddress(orderSheet.getEndRestAddress())
                .orderTime(orderSheet.getOrderTime())
                .Addressee(orderSheet.getAddressee())
                .phone(orderSheet.getPhone())
                .AddresseeEmail(orderSheet.getAddresseeEmail())
                .build();
    }
	
	default PaymentDTO.Response entityToDTO(Payment payment) {
	    return PaymentDTO.Response.builder()
	            .paymentNo(payment.getPaymentNo())
	            .orderSheetNo(payment.getOrderSheet().getOrderNo())
	            .paymentId(payment.getPaymentId())
	            .paymentMethod(payment.getPaymentMethod())
	            .easyPayProvider(payment.getEasyPayProvider())
	            .currency(payment.getCurrency())
	            .paymentStatus(payment.getPaymentStatus())
	            .paidAt(payment.getPaidAt())
	            .build();
	}
}
