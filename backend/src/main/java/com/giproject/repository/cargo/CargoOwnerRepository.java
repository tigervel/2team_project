package com.giproject.repository.cargo;

import com.giproject.entity.cargo.CargoOwner;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CargoOwnerRepository extends JpaRepository<CargoOwner, String> {

    // cargoId 존재 여부
    boolean existsByCargoId(String cargoId);

    // cargoId로 조회
    Optional<CargoOwner> findByCargoId(String cargoId);

    // ✅ 존재 여부: boolean 반환 (수정 포인트)
    boolean existsByCargoEmail(String cargoEmail);

    // 필요하면 조회 메서드도 함께
    Optional<CargoOwner> findByCargoEmail(String cargoEmail);
}
