package com.giproject.dto.admin;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminMemberDTO {

	private String memName;
    private String memEmail;
    private String memPhone;
    private LocalDateTime memCreateIdDateTime;
}