package com.giproject.dto.admin;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminMemberDTO {
    // OWNER(물주) | COWNER(차주) | ADMIN(관리자)
    private String type;

    private String memId;

    private String memName;
    private String memEmail;
    private String memPhone;
    private String memAdress;
    private LocalDateTime memCreateidDateTime;
}