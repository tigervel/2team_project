package com.giproject.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
//관리자 정보 DTO
public class AdminDTO {

	private String admin;//관리자 Id
	private String adPw;//관리자 Pw
}
