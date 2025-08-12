package com.giproject.controller;

import com.giproject.dto.member.MemberDTO;
import com.giproject.entity.member.Member;
import com.giproject.repository.member.MemberRepository;
import com.giproject.service.member.MemberService;
import com.giproject.service.member.NaverOAuthService;
import com.giproject.utils.JWTUtil;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@Log4j2
@RestController
@RequestMapping("/g2i4/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberRepository memberRepository;
    private final MemberService memberService;
    private final NaverOAuthService naverOAuthService;

    // 로그인된 사용자 정보 조회
    @GetMapping("/info")
    public MemberDTO getMemberInfo(HttpSession session) {
        String memId = (String) session.getAttribute("loginId"); // 세션에서 로그인한 아이디 가져오기
        Member member = memberRepository.findById(memId).orElseThrow(() -> new RuntimeException("회원 정보 없음"));

        return new MemberDTO(
            member.getMemId(),
            null, // 비밀번호는 전달하지 않음
            member.getMemEmail(),
            member.getMemName(),
            member.getMemPhone(),
            member.getMemAddress(),
            member.getMemCreateIdDateTime(),
            member.getMemberRoleList()
        );
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
    
    @GetMapping("/naver/callback")
    public Map<String, Object> naverCallback(@RequestParam String code, @RequestParam String state) {
        // 1) 인가 코드로 액세스 토큰 발급
        String accessToken = naverOAuthService.getAccessToken(code, state);

        // 2) 액세스 토큰으로 사용자 프로필 조회
        Map<String, Object> userProfile = naverOAuthService.getUserProfile(accessToken);

        // 3) 회원가입 / 로그인 처리 로직 추가 가능

        return userProfile; // 임시로 사용자 정보 반환
    }
}