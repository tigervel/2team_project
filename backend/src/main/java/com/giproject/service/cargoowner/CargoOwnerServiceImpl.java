package com.giproject.service.cargoowner;

import com.giproject.dto.common.UserResponseDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.repository.cargo.CargoOwnerRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class CargoOwnerServiceImpl implements CargoOwnerService {

    private final CargoOwnerRepository cargoOwnerRepository;

    @Override
    public UserResponseDTO getSessionUserInfo(HttpSession session) {
        CargoOwner owner = (CargoOwner) session.getAttribute("cargoOwner");
        return new UserResponseDTO(
                owner.getCargoId(),
                owner.getCargoName(),
                owner.getCargoEmail(),
                owner.getCargoPhone(),
                owner.getCargoAddress(),
                owner.getCargoCreatedDateTime()
        );
    }

    @Override
    public CargoOwner registerCargoOwner(String name, String email, String phone, String address) {
        CargoOwner owner = CargoOwner.builder()
                .cargoId(UUID.randomUUID().toString())
                .cargoName(name)
                .cargoEmail(email)
                .cargoPhone(phone)
                .cargoAddress(address)
                .cargoCreatedDateTime(LocalDateTime.now())
                .build();

        return cargoOwnerRepository.save(owner); // DB 저장
    }
}
