package com.giproject.service.admin;

import com.giproject.dto.admin.AdminMemberSearchDTO;
import com.giproject.dto.admin.DeliveryDetailDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.member.Member;
import com.giproject.repository.delivery.DeliveryRepository;
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

    @Override
    public List<AdminMemberSearchDTO> searchUserForDeliveryPage(String query) {
        List<AdminMemberSearchDTO> results = new ArrayList<>();

        // Search for Member
        String memberJpql = "SELECT m FROM Member m WHERE m.memName LIKE :query OR m.memEmail LIKE :query OR m.memPhone LIKE :query";
        TypedQuery<Member> memberQuery = entityManager.createQuery(memberJpql, Member.class);
        memberQuery.setParameter("query", "%" + query + "%");
        List<Member> members = memberQuery.getResultList();

        for (Member member : members) {
            List<Delivery> deliveries = deliveryRepository.findAll().stream()
                    .filter(d -> d.getPayment() != null && d.getPayment().getOrderSheet() != null && d.getPayment().getOrderSheet().getAddresseeEmail().equals(member.getMemEmail()))
                    .collect(Collectors.toList());

            List<DeliveryDetailDTO> details = deliveries.stream()
                    .map(d -> DeliveryDetailDTO.builder()
                            .date(d.getPayment().getOrderSheet().getOrderTime().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")))
                            .start(d.getPayment().getOrderSheet().getStartRestAddress())
                            .end(d.getPayment().getOrderSheet().getEndRestAddress())
                            .distance("105KM") // TODO: Calculate distance
                            .type("목재") // TODO: Get cargo type
                            .amount(String.format("%,d원", d.getPayment().getOrderSheet().getMatching().getEstimate().getTotalCost()))
                            .owner(d.getPayment().getOrderSheet().getMatching().getEstimate().getMember().getMemName())
                            .build())
                    .collect(Collectors.toList());

            List<String> history = deliveries.stream()
                    .filter(d -> d.getStatus().toString().equals("COMPLETED"))
                    .map(d -> d.getPayment().getOrderSheet().getStartRestAddress() + " -> " + d.getPayment().getOrderSheet().getEndRestAddress() + " (" + d.getCompletTime().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")) + ")")
                    .collect(Collectors.toList());

            results.add(AdminMemberSearchDTO.builder()
                    .name(member.getMemName())
                    .email(member.getMemEmail())
                    .phone(member.getMemPhone())
                    .orders(deliveries.size())
                    .status(deliveries.isEmpty() ? "N/A" : deliveries.get(0).getStatus().toString())
                    .details(details)
                    .history(history)
                    .build());
        }

        // Search for CargoOwner
        String cargoOwnerJpql = "SELECT c FROM CargoOwner c WHERE c.cargoName LIKE :query OR c.cargoEmail LIKE :query OR c.cargoPhone LIKE :query";
        TypedQuery<CargoOwner> cargoOwnerQuery = entityManager.createQuery(cargoOwnerJpql, CargoOwner.class);
        cargoOwnerQuery.setParameter("query", "%" + query + "%");
        List<CargoOwner> cargoOwners = cargoOwnerQuery.getResultList();

        for (CargoOwner cargoOwner : cargoOwners) {
             List<Delivery> deliveries = deliveryRepository.findAll().stream()
                    .filter(d -> d.getPayment() != null && d.getPayment().getOrderSheet() != null && d.getPayment().getOrderSheet().getAddresseeEmail().equals(cargoOwner.getCargoEmail()))
                    .collect(Collectors.toList());

            List<DeliveryDetailDTO> details = deliveries.stream()
                    .map(d -> DeliveryDetailDTO.builder()
                            .date(d.getPayment().getOrderSheet().getOrderTime().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")))
                            .start(d.getPayment().getOrderSheet().getStartRestAddress())
                            .end(d.getPayment().getOrderSheet().getEndRestAddress())
                            .distance("105KM") // TODO: Calculate distance
                            .type("목재") // TODO: Get cargo type
                            .amount(String.format("%,d원", d.getPayment().getOrderSheet().getMatching().getEstimate().getTotalCost()))
                            .owner(d.getPayment().getOrderSheet().getMatching().getEstimate().getMember().getMemName())
                            .build())
                    .collect(Collectors.toList());

            List<String> history = deliveries.stream()
                    .filter(d -> d.getStatus().toString().equals("COMPLETED"))
                    .map(d -> d.getPayment().getOrderSheet().getStartRestAddress() + " -> " + d.getPayment().getOrderSheet().getEndRestAddress() + " (" + d.getCompletTime().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")) + ")")
                    .collect(Collectors.toList());

            results.add(AdminMemberSearchDTO.builder()
                    .name(cargoOwner.getCargoName())
                    .email(cargoOwner.getCargoEmail())
                    .phone(cargoOwner.getCargoPhone())
                    .orders(deliveries.size())
                    .status(deliveries.isEmpty() ? "N/A" : deliveries.get(0).getStatus().toString())
                    .details(details)
                    .history(history)
                    .build());
        }

        return results;
    }
}

