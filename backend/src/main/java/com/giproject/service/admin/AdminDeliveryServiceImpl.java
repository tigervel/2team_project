package com.giproject.service.admin;

import com.giproject.dto.admin.AdminMemberSearchDTO;
import com.giproject.dto.admin.DeliveryDetailDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.delivery.DeliveryStatus;
import com.giproject.entity.member.Member;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.delivery.DeliveryRepository;
import com.giproject.repository.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDeliveryServiceImpl implements AdminDeliveryService {

    private final EntityManager entityManager;
    private final DeliveryRepository deliveryRepository;
    private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;

    @Override
    public List<AdminMemberSearchDTO> searchUserForDeliveryPage(String query) {
        List<AdminMemberSearchDTO> results = new ArrayList<>();

        // 1. Search for Member (Owner)
        List<Member> members = memberRepository.findByMemNameContainingIgnoreCaseOrMemEmailContainingIgnoreCaseOrMemPhoneContainingIgnoreCase(query, query, query);

        for (Member member : members) {
            List<Delivery> deliveries = deliveryRepository.findDeliveriesByOwnerMemId(member.getMemId());

            // TODO: Fetch deliveries for Member (Owner) using the correct path
            // Example: deliveries = deliveryRepository.findByPayment_OrderSheet_Matching_Estimate_Member_MemId(member.getMemId());

            List<DeliveryDetailDTO> details = deliveries.stream()
                    .map(d -> DeliveryDetailDTO.builder()
                            .date(d.getPayment().getOrderSheet().getOrderTime().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")))
                            .start(d.getPayment().getOrderSheet().getStartRestAddress())
                            .end(d.getPayment().getOrderSheet().getEndRestAddress())
                            .distance(String.format("%.1fKM", d.getPayment().getOrderSheet().getMatching().getEstimate().getDistanceKm()))
                            .type(d.getPayment().getOrderSheet().getMatching().getEstimate().getCargoType())
                            .amount(String.format("%,d원", d.getPayment().getOrderSheet().getMatching().getEstimate().getTotalCost()))
                            .owner(d.getPayment().getOrderSheet().getMatching().getEstimate().getMember().getMemName())
                            .build())
                    .collect(Collectors.toList());

            List<String> history = deliveries.stream()
                    .filter(d -> d.getStatus().equals(DeliveryStatus.COMPLETED))
                    .map(d -> d.getPayment().getOrderSheet().getStartRestAddress() + " -> " + d.getPayment().getOrderSheet().getEndRestAddress() + " (" + d.getCompletTime().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")) + ")")
                    .collect(Collectors.toList());

                        results.add(AdminMemberSearchDTO.builder()
                    .name(member.getMemName())
                    .email(member.getMemEmail())
                    .phone(member.getMemPhone())
                    .userId(member.getMemId()) // Set userId for Member
                    .userType("OWNER").build()); // Set user type
        }

        // 2. Search for CargoOwner (Cowner)
        List<CargoOwner> cargoOwners = cargoOwnerRepository.findByCargoNameContainingIgnoreCaseOrCargoEmailContainingIgnoreCaseOrCargoPhoneContainingIgnoreCase(query, query, query);

        for (CargoOwner cargoOwner : cargoOwners) {
            List<Delivery> deliveries = deliveryRepository.findDeliveriesByCargoOwnerCargoId(cargoOwner.getCargoId());

            // TODO: Fetch deliveries for CargoOwner using the correct path
            // Example: deliveries = deliveryRepository.findByPayment_OrderSheet_Matching_CargoOwner_CargoId(cargoOwner.getCargoId());

            List<DeliveryDetailDTO> details = deliveries.stream()
                    .map(d -> DeliveryDetailDTO.builder()
                            .date(d.getPayment().getOrderSheet().getOrderTime().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")))
                            .start(d.getPayment().getOrderSheet().getStartRestAddress())
                            .end(d.getPayment().getOrderSheet().getEndRestAddress())
                            .distance(String.format("%.1fKM", d.getPayment().getOrderSheet().getMatching().getEstimate().getDistanceKm()))
                            .type(d.getPayment().getOrderSheet().getMatching().getEstimate().getCargoType())
                            .amount(String.format("%,d원", d.getPayment().getOrderSheet().getMatching().getEstimate().getTotalCost()))
                            .owner(d.getPayment().getOrderSheet().getMatching().getEstimate().getMember().getMemName())
                            .build())
                    .collect(Collectors.toList());

            List<String> history = deliveries.stream()
                    .filter(d -> d.getStatus().equals(DeliveryStatus.COMPLETED))
                    .map(d -> d.getPayment().getOrderSheet().getStartRestAddress() + " -> " + d.getPayment().getOrderSheet().getEndRestAddress() + " (" + d.getCompletTime().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")) + ")")
                    .collect(Collectors.toList());

                        results.add(AdminMemberSearchDTO.builder()
                    .name(cargoOwner.getCargoName())
                    .email(cargoOwner.getCargoEmail())
                    .phone(cargoOwner.getCargoPhone())
                    .userId(cargoOwner.getCargoId()) // Set userId for CargoOwner
                    .userType("COWNER").build()); // Set user type
        }

        return results;
    }
}

