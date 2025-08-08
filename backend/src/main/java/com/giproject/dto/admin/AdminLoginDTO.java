package com.giproject.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
//관리자 로그인 DTO
//관리자 로그인 응답용 ResponseDTO 추후 생성
public class AdminLoginDTO {

	private String admin;
	
	private String adPw;
}
