package com.giproject.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.member.MemberDTO;
import com.giproject.dto.secure.MemberModifyDTO;
import com.giproject.service.member.MemberService;
import com.giproject.utils.JWTUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
public class SNSController {

	private final MemberService memberService;
	
	// 수정 요청 처리
	@PutMapping("/api/member/modify")
	public Map<String, String> modify(@RequestBody MemberModifyDTO dto)
	{
		log.info(dto);
		
		memberService.modifyMember(dto);
		
		return Map.of("result", "수정 성공");
	}
	
	
	@GetMapping("/api/member/kakao")
	public Map<String, Object> getMemberFromKakao(@RequestParam("accessToken") String accessToKen)
	{
		log.info("---------------------accessToken--------------------- :::: " + accessToKen);
		
		MemberDTO dto = memberService.getKakaoMember(accessToKen);
		
		// dto 정보를 생성했으니 이 사용자에게 access token 을 발행해서 같이 넘겨줌
		Map<String, Object> claims = dto.getClaims();
		
		// 토큰 생성
		String jwtAccessToken = JWTUtil.generateToken(claims, 10 * 6);
		String jwtRefreshToken = JWTUtil.generateToken(claims, 60 * 24);
		
		log.info("jwtAccessToken -----------------> " + jwtAccessToken);
		log.info("jwtRefreshToken -----------------> " + jwtRefreshToken);
		
		claims.put("accessToken", jwtAccessToken);
		claims.put("refreshToken", jwtRefreshToken);
		
		return claims;
		
		
	}
	
}