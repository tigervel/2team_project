// com.giproject.dto.auth
package com.giproject.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SocialSignupCompleteRequest {

    @NotBlank
    private String ticket;           // 소셜 시작 단계에서 발급한 1회성 티켓

    @NotBlank @Size(min=8, max=15) @Pattern(regexp = "^[A-Za-z0-9]+$")
    private String loginId;          // 사용자가 고른 서비스 ID(=memId or cargoId)

    @NotBlank @Size(min=8, max=20)
    private String password;         // 로그인 방식이 ID/PW라면 반드시 받기

    @NotBlank
    private String name;

    @Email @NotBlank
    private String email;

    private String phone;
    private String address;

    @NotBlank
    private String role;             // "SHIPPER" or "DRIVER" (화주/차주)
}
