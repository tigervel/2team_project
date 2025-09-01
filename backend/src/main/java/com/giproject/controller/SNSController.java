package com.giproject.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.secure.MemberModifyDTO;
import com.giproject.dto.member.MemberDTO;
import com.giproject.service.member.MemberService;
import com.giproject.utils.JwtTokenUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
public class SNSController {

	private final MemberService memberService;	
	
	@GetMapping("/api/member/kakao")
	public Map<String, Object> getMemberFromKakao(@RequestParam("accessToken") String accessToKen)
	{
		log.info("---------------------accessToken--------------------- :::: " + accessToKen);
		
		MemberDTO dto = memberService.getKakaoMember(accessToKen);
		
		// dto 정보를 생성했으니 이 사용자에게 access token 을 발행해서 같이 넘겨줌
		Map<String, Object> claims = dto.getClaims();
		
		// 토큰 생성
		String jwtAccessToken = JwtTokenUtils.generateToken(claims, 10 * 6);
		String jwtRefreshToken = JwtTokenUtils.generateToken(claims, 60 * 24);
		
		log.info("jwtAccessToken -----------------> " + jwtAccessToken);
		log.info("jwtRefreshToken -----------------> " + jwtRefreshToken);
		
		claims.put("accessToken", jwtAccessToken);
		claims.put("refreshToken", jwtRefreshToken);
		
		return claims;
		
		
	}
	
	@GetMapping("/api/member/naver")
	public Map<String, Object> getMemberFromNaver(@RequestParam("accessToken") String accessToken) {
	    log.info("--------------------- Naver accessToken --------------------- :::: " + accessToken);

	    // 네이버 회원 정보 조회 서비스 호출
	    MemberDTO dto = memberService.getNaverMember(accessToken);

	    // MemberDTO 에서 JWT 생성용 클레임 정보 추출
	    Map<String, Object> claims = dto.getClaims();

	    // JWT Access / Refresh 토큰 생성 (예: 10분, 24시간)
	    String jwtAccessToken = JwtTokenUtils.generateToken(claims, 10 * 6);
	    String jwtRefreshToken = JwtTokenUtils.generateToken(claims, 60 * 24);

	    log.info("jwtAccessToken -----------------> " + jwtAccessToken);
	    log.info("jwtRefreshToken -----------------> " + jwtRefreshToken);

	    // 토큰 포함해 반환
	    claims.put("accessToken", jwtAccessToken);
	    claims.put("refreshToken", jwtRefreshToken);

	    return claims;
	}

	
}