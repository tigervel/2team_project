package com.giproject.entity.cargo;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "cargo_owner") // ← 테이블 이름도 snake_case
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CargoOwner {

    @Id
    @Column(name = "cargo_id") // ← 컬럼 이름 명시
    private String cargoId;

    @Column(name = "cargo_pw")
    private String cargoPw;

    @Column(name = "cargo_email")
    private String cargoEmail;

    @Column(name = "cargo_name")
    private String cargoName;

    @Column(name = "cargo_phone")
    private String cargoPhone;

    @Column(name = "cargo_address")
    private String cargoAddress;

    @Column(name = "cargo_created_datetime")
    private LocalDateTime cargoCreateidDateTime;

    @OneToMany(mappedBy = "cargoOwner", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Cargo> cargoList;
}
