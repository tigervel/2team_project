package com.giproject.controller;

import static com.giproject.security.jwt.JwtClaimKeys.*;

import java.util.*;
import java.util.stream.Collectors;

import com.giproject.dto.member.MemberDTO;
import com.giproject.security.JwtService;
import com.giproject.service.member.MemberService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Log4j2
@RequiredArgsConstructor
public class SNSController {

    private final MemberService memberService;
    private final JwtService jwtService;

    // ✅ 실제 권한을 읽어오려면 필요
    private final UserDetailsService userDetailsService;

    /** 카카오 액세스 토큰 → 우리 회원 확인/생성 → 우리 JWT 발급 */
    @GetMapping("/api/member/kakao")
    public ResponseEntity<Map<String, Object>> getMemberFromKakao(@RequestParam("accessToken") String kakaoAccessToken) {
        log.info("Kakao accessToken: {}", kakaoAccessToken);

        MemberDTO dto = memberService.getKakaoMember(kakaoAccessToken); // 내부 회원화(없으면 생성)
        String subject = dto.getMemId();                                 // 내부 로그인키 (sub)

        Map<String, Object> claims = buildClaimsForJwt(dto, "KAKAO", dto.getSocialId(), loadAuthorities(subject));

        String jwtAccessToken  = jwtService.createAccessToken(claims, subject);
        String jwtRefreshToken = jwtService.createRefreshToken(Map.of(UID, subject), subject);

        Map<String, Object> resp = new HashMap<>();
        resp.put("accessToken", jwtAccessToken);
        resp.put("refreshToken", jwtRefreshToken);
        return ResponseEntity.ok(resp);
    }

    /** 네이버 액세스 토큰 → 우리 회원 확인/생성 → 우리 JWT 발급 */
    @GetMapping("/api/member/naver")
    public ResponseEntity<Map<String, Object>> getMemberFromNaver(@RequestParam("accessToken") String naverAccessToken) {
        log.info("Naver accessToken: {}", naverAccessToken);

        MemberDTO dto = memberService.getNaverMember(naverAccessToken);
        String subject = dto.getMemId();

        Map<String, Object> claims = buildClaimsForJwt(dto, "NAVER", dto.getSocialId(), loadAuthorities(subject));

        String jwtAccessToken  = jwtService.createAccessToken(claims, subject);
        String jwtRefreshToken = jwtService.createRefreshToken(Map.of(UID, subject), subject);

        Map<String, Object> resp = new HashMap<>();
        resp.put("accessToken", jwtAccessToken);
        resp.put("refreshToken", jwtRefreshToken);
        return ResponseEntity.ok(resp);
    }

    // ---- Helpers ----

    /** 로그인 ID의 실제 권한을 UserDetailsService에서 로드 → ROLE_* 목록 반환 */
    private List<String> loadAuthorities(String loginId) {
        var ud = userDetailsService.loadUserByUsername(loginId);
        // 중복 제거 + 정렬 유지
        return ud.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .distinct()
                .collect(Collectors.toCollection(LinkedHashSet::new))
                .stream().toList();
    }

    /** JWT에 담을 클레임(이름 제외, uid/email/provider/providerId/roles) */
    private Map<String, Object> buildClaimsForJwt(MemberDTO dto, String provider, String providerId, List<String> roles) {
        Map<String, Object> c = new HashMap<>();
        if (dto.getMemId() != null && !dto.getMemId().isBlank()) {
            c.put(UID, dto.getMemId());          // 로그인 ID
        }
        if (dto.getMemEmail() != null && !dto.getMemEmail().isBlank()) {
            c.put(EMAIL, dto.getMemEmail());     // 이메일(선택)
        }

        // ✅ 실제 권한 사용 (예: [ROLE_USER, ROLE_SHIPPER])
        if (roles == null || roles.isEmpty()) {
            roles = List.of("ROLE_USER");
        }
        c.put(ROLES, roles);

        if (provider != null && !provider.isBlank())     c.put(PROVIDER, provider);
        if (providerId != null && !providerId.isBlank()) c.put(PROVIDER_ID, providerId);

        // ❌ 이름(NAME)은 요구사항에 따라 제외
        return c;
    }
}
