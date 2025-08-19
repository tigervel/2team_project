// com.giproject.entity.account.UserIndex
package com.giproject.entity.account;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_index")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserIndex {

    public enum Role { SHIPPER, DRIVER }

    // ★ 문자열 PK (login_id)
    @Id
    @Column(name = "login_id", length = 50, nullable = false)
    private String loginId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20, nullable = false)
    private Role role;
}

