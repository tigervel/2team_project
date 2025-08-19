package com.giproject.repository.cargo;

import com.giproject.entity.cargo.CargoOwner;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CargoOwnerRepository extends JpaRepository<CargoOwner, String> {
    // 필요 시 cargoId 중복 확인 같은 메서드 추가 가능
    boolean existsByCargoId(String cargoId);
    
    Optional<CargoOwner> findByCargoId(String cargoId);
}