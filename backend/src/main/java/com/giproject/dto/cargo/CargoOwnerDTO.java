// com.giproject.dto.cargo.CargoOwnerDTO
package com.giproject.dto.cargo;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.giproject.entity.cargo.CargoOwner;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString(exclude = "cargoPw") // 비밀번호 로그 노출 방지
public class CargoOwnerDTO extends User {

    private String cargoId;
    @JsonIgnore
    private String cargoPw; // 직렬화/응답 방지 (절대 토큰/클레임에 넣지 마세요)
    private String cargoEmail;
    private String cargoName;
    private String cargoPhone;
    private String cargoAddress;
    private LocalDateTime cargoCreatedDateTime;
    private List<String> roleNames = new ArrayList<>();

    public CargoOwnerDTO(
            String cargoId,
            String cargoPw,
            String cargoEmail,
            String cargoName,
            String cargoPhone,
            String cargoAddress,
            LocalDateTime cargoCreatedDateTime,
            List<String> roleNames
    ) {
        super(
            cargoId,
            cargoPw,
            roleNames.stream()
                     .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                     .collect(Collectors.toList())
        );
        this.cargoId = cargoId;
        this.cargoPw = cargoPw;
        this.cargoEmail = cargoEmail;
        this.cargoName = cargoName;
        this.cargoPhone = cargoPhone;
        this.cargoAddress = cargoAddress;
        this.cargoCreatedDateTime = cargoCreatedDateTime;
        this.roleNames = roleNames;
    }

    /** 엔티티 -> DTO (roles 전달) */
    public static CargoOwnerDTO fromCargoOwner(CargoOwner c, List<String> roles) {
        List<String> r = (roles == null || roles.isEmpty())
                ? new ArrayList<>(List.of("USER"))
                : new ArrayList<>(roles);
        // 도메인 역할(차주) 자동 포함 → 인가에서 ROLE_DRIVER로 게이트 가능
        if (!r.contains("DRIVER")) r.add("DRIVER");

        return new CargoOwnerDTO(
            c.getCargoId(),
            c.getCargoPw(),                  // BCrypt 해시 전제
            c.getCargoEmail(),
            c.getCargoName(),
            c.getCargoPhone(),
            c.getCargoAddress(),
            c.getCargoCreatedDateTime(),
            r
        );
    }

    /** 엔티티 -> DTO (roles 생략 시 기본 USER만) */
    public static CargoOwnerDTO fromCargoOwner(CargoOwner c) {
        return fromCargoOwner(c, List.of("USER"));
    }

    /** JWT 등에 넣을 안전한 클레임(비밀번호 제외) */
    public Map<String, Object> getClaims() {
        Map<String, Object> m = new HashMap<>();
        m.put("cargoId", cargoId);
        m.put("cargoEmail", cargoEmail);
        m.put("cargoName", cargoName);
        m.put("cargoPhone", cargoPhone);
        m.put("cargoAddress", cargoAddress);
        m.put("cargoCreatedDateTime", cargoCreatedDateTime);
        m.put("rolenames", roleNames);
        return m;
    }
}
