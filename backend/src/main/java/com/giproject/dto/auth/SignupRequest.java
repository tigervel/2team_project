package com.giproject.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SignupRequest {

    /** "SHIPPER"(화주) | "DRIVER"(차주) */
    @NotBlank
    private String role;

    /** 서비스 로그인 ID (memId or cargoId 공용) */
    @NotBlank @Size(min = 8, max = 15)
    @Pattern(regexp = "^[A-Za-z0-9]+$")
    private String loginId;

    @NotBlank @Size(min = 8, max = 20)
    private String password;

    @NotBlank
    private String name;

    @Email @NotBlank
    private String email;

    private String phone;
    private String address;
}
