package com.giproject.service.admin;

import com.giproject.dto.admin.AdminMemberSearchDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDeliveryServiceImpl implements AdminDeliveryService {

    private final EntityManager entityManager;

    @Override
    public List<AdminMemberSearchDTO> searchUserForDeliveryPage(String query) {
        List<AdminMemberSearchDTO> results = new ArrayList<>();

        // Search for Member
        String memberJpql = "SELECT m FROM Member m WHERE m.memName LIKE :query OR m.memEmail LIKE :query OR m.memPhone LIKE :query";
        TypedQuery<Member> memberQuery = entityManager.createQuery(memberJpql, Member.class);
        memberQuery.setParameter("query", "%" + query + "%");
        List<Member> members = memberQuery.getResultList();

        for (Member member : members) {
            results.add(AdminMemberSearchDTO.builder()
                    .name(member.getMemName())
                    .email(member.getMemEmail())
                    .phone(member.getMemPhone())
                    .build());
        }

        // Search for CargoOwner
        String cargoOwnerJpql = "SELECT c FROM CargoOwner c WHERE c.cargoName LIKE :query OR c.cargoEmail LIKE :query OR c.cargoPhone LIKE :query";
        TypedQuery<CargoOwner> cargoOwnerQuery = entityManager.createQuery(cargoOwnerJpql, CargoOwner.class);
        cargoOwnerQuery.setParameter("query", "%" + query + "%");
        List<CargoOwner> cargoOwners = cargoOwnerQuery.getResultList();

        for (CargoOwner cargoOwner : cargoOwners) {
            results.add(AdminMemberSearchDTO.builder()
                    .name(cargoOwner.getCargoName())
                    .email(cargoOwner.getCargoEmail())
                    .phone(cargoOwner.getCargoPhone())
                    .build());
        }

        return results;
    }
}

