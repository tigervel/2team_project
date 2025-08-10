package com.giproject.controller;

import com.giproject.dto.member.MemberDTO;
import com.giproject.entity.member.Member;
import com.giproject.repository.member.MemberRepository;
import com.giproject.service.member.MemberService;
import com.giproject.utils.JWTUtil;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@Log4j2
@RestController
@RequestMapping("/g2i4/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberRepository memberRepository;
    private final MemberService memberService;

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


    // 회원 정보 수정
    @PostMapping("/update")
    public String updateMember(@RequestBody MemberDTO dto, HttpSession session) {
        String memId = (String) session.getAttribute("loginId");
        Member member = memberRepository.findById(memId)
                .orElseThrow(() -> new RuntimeException("회원 정보 없음"));

        // 변경 항목 적용
        member.changeMemAddress(dto.getMemAddress());
        member.changeMemPhone(dto.getMemPhone());

        memberRepository.save(member);
        return "회원 정보가 성공적으로 수정되었습니다.";
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