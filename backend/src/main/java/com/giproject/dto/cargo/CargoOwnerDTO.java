package com.giproject.dto.cargo;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.giproject.entity.account.UserIndex;
import com.giproject.entity.cargo.CargoOwner;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString(exclude = "cargoPw")
public class CargoOwnerDTO extends User {

    private static final long serialVersionUID = 1L;

    private String cargoId;

    @JsonIgnore
    private String cargoPw;

    private String cargoEmail;
    private String cargoName;
    private String cargoPhone;
    private String cargoAddress;
    private LocalDateTime cargoCreatedDateTime;

    private List<String> roleNames = new ArrayList<>();

    private String accessToken;
    private String refreshToken;

    public CargoOwnerDTO(String cargoId,
                         String cargoPw,
                         String cargoEmail,
                         String cargoName,
                         String cargoPhone,
                         String cargoAddress,
                         LocalDateTime cargoCreatedDateTime,
                         List<String> roleNames) {

        super(
            cargoId,
            (cargoPw == null ? "" : cargoPw),
            roleNames.stream()
                     .filter(Objects::nonNull)
                     .map(String::trim)
                     .filter(s -> !s.isEmpty())
                     .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                     .distinct()
                     .map(SimpleGrantedAuthority::new)
                     .collect(Collectors.toList())
        );

        this.cargoId = cargoId;
        this.cargoPw = cargoPw;
        this.cargoEmail = cargoEmail;
        this.cargoName = cargoName;
        this.cargoPhone = cargoPhone;
        this.cargoAddress = cargoAddress;
        this.cargoCreatedDateTime = cargoCreatedDateTime;
        this.roleNames = (roleNames != null) ? new ArrayList<>(roleNames) : new ArrayList<>();
    }

    public static CargoOwnerDTO fromCargoOwner(CargoOwner c) {
        boolean isAdmin = false;
        try {
            UserIndex ui = c.getUserIndex();
            isAdmin = (ui != null && ui.getRole() == UserIndex.Role.ADMIN);
        } catch (Exception ignore) {}

        List<String> roles = new ArrayList<>(2);
        roles.add("DRIVER");
        roles.add(isAdmin ? "ADMIN" : "USER");

        return new CargoOwnerDTO(
            c.getCargoId(),
            c.getCargoPw(),
            c.getCargoEmail(),
            c.getCargoName(),
            c.getCargoPhone(),
            c.getCargoAddress(),
            c.getCargoCreatedDateTime(),
            roles
        );
    }

    public CargoOwnerDTO withTokens(String access, String refresh) {
        this.accessToken = access;
        this.refreshToken = refresh;
        return this;
    }

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
