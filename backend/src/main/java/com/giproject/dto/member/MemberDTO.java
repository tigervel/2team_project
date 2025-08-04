package com.giproject.dto.member;

import java.time.LocalDateTime;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberDTO {
	
	private String memId;
	private String memPw;
	private String memEmail;
	private String memName;
	private String memPhone;
	private String memAddress;
	private LocalDateTime memCreateIdDateTime;
}
