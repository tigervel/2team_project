package com.giproject.repository.cargo;

import com.giproject.entity.cargo.CargoOwner;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CargoOwnerRepository extends JpaRepository<CargoOwner, String> {
    // 필요 시 cargoId 중복 확인 같은 메서드 추가 가능
    boolean existsByCargoId(String cargoId);
    
    Optional<CargoOwner> findByCargoId(String cargoId);

    List<CargoOwner> findByCargoNameContainingIgnoreCaseOrCargoEmailContainingIgnoreCaseOrCargoPhoneContainingIgnoreCase(String cargoName, String cargoEmail, String cargoPhone);

    long countByCargoCreatedDateTimeAfter(LocalDateTime date);

    @Query("SELECT FUNCTION('DATE_FORMAT', c.cargoCreatedDateTime, '%Y-%m'), COUNT(c) FROM CargoOwner c GROUP BY FUNCTION('DATE_FORMAT', c.cargoCreatedDateTime, '%Y-%m')")
    List<Object[]> findNewCargoOwnersByMonth();
}