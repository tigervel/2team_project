// src/main/java/com/giproject/dto/member/MemberDTO.java
package com.giproject.dto.member;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString(exclude = "memPw") // 비밀번호 로그 노출 방지
public class MemberDTO extends User {

    private static final long serialVersionUID = 1L;

    /** == loginId 개념 (Spring Security username) */
    private String memId;

    @JsonIgnore
    private String memPw; // 직렬화 방지(안전)

    private String memEmail;
    private String memName;
    private String memPhone;
    private String memAddress;
    private LocalDateTime memCreateIdDateTime;

    /** 권한 이름(예: "USER","ADMIN"). 생성자에서 "ROLE_" 접두 자동 보정 */
    private List<String> roleNames = new ArrayList<>();

    /** 🔽 소셜 로그인 관련(있으면 세팅) */
    private String provider;  // "KAKAO" | "NAVER" | "GOOGLE" | "LOCAL" | null
    private String socialId;  // 각 제공자 고유 식별자(카카오 id, 네이버 id, 구글 sub 등)

    /** 🔽 응답용 토큰 */
    private String accessToken;
    private String refreshToken;

    // ===== 기본 생성자(권한 자동 보정) =====
    public MemberDTO(String memId,
                     String memPw,
                     String memEmail,
                     String memName,
                     String memPhone,
                     String memAddress,
                     LocalDateTime memCreateIdDateTime,
                     List<String> rolenames) {

        super(
            // User(username, password, authorities)
            memId,
            (memPw == null ? "" : memPw),
            (rolenames == null ? List.<String>of() : rolenames).stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList())
        );

        this.memId = memId;
        this.memPw = memPw;
        this.memEmail = memEmail;
        this.memName = memName;
        this.memPhone = memPhone;
        this.memAddress = memAddress;
        this.memCreateIdDateTime = memCreateIdDateTime;
        this.roleNames = rolenames != null ? new ArrayList<>(rolenames) : new ArrayList<>();
    }

    /** 계정 상태 플래그 제어가 필요한 경우 사용(선택) */
    public MemberDTO(String memId,
                     String memPw,
                     boolean enabled,
                     boolean accountNonExpired,
                     boolean credentialsNonExpired,
                     boolean accountNonLocked,
                     List<SimpleGrantedAuthority> authorities) {
        super(memId,
              (memPw == null ? "" : memPw),
              enabled, accountNonExpired, credentialsNonExpired, accountNonLocked,
              authorities);
        this.memId = memId;
        this.memPw = memPw;
    }

    /** 안전한 클레임(비밀번호 제외) */
    public Map<String, Object> getClaims() {
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("memId", memId);
        dataMap.put("memEmail", memEmail);
        dataMap.put("memName", memName);
        dataMap.put("memPhone", memPhone);
        dataMap.put("memAddress", memAddress);
        dataMap.put("memCreateIdDateTime", memCreateIdDateTime);
        dataMap.put("rolenames", roleNames); // 기존 호환 유지
        if (provider != null) dataMap.put("provider", provider);
        if (socialId != null) dataMap.put("socialId", socialId);
        return dataMap;
    }

    /** 엔티티 → DTO 변환 (roles 전달) */
    public static MemberDTO fromMember(com.giproject.entity.member.Member m, List<String> roles) {
        List<String> r = (roles == null || roles.isEmpty())
                ? new ArrayList<>(List.of("USER"))
                : new ArrayList<>(roles);

        // 도메인 역할(예: 화주/차주) 자동 포함해 인가 편의 제공 (예외 안전)
        try {
            if (m.getUserIndex() != null && m.getUserIndex().getRole() != null) {
                String domainRole = m.getUserIndex().getRole().name();
                if (domainRole != null && !domainRole.isBlank()) {
                    r.add(domainRole);
                }
            }
        } catch (Exception ignore) { /* 안전 차원 */ }

        return new MemberDTO(
            m.getMemId(),
            m.getMemPw(),                 // 해시 저장 전제
            m.getMemEmail(),
            m.getMemName(),
            m.getMemPhone(),
            m.getMemAddress(),
            m.getMemCreateIdDateTime(),
            r
        );
    }

    /** 엔티티 → DTO 변환 (roles 생략 시 엔티티의 memberRoleList 사용) */
    public static MemberDTO fromMember(com.giproject.entity.member.Member m) {
        return fromMember(m, m.getMemberRoleList());
    }

    /** 소셜 제공자 고유 식별자 반환 */
    public String getSocialId() { return socialId; }

    /** 편의: loginId 별칭 */
    public String getLoginId() { return memId; }

    // ====== ✅ 정적 팩토리 (빌더 충돌 회피) ======

    /** 비밀번호 모를 때(응답 DTO 중심) */
    public static MemberDTO of(String loginId,
                               String email,
                               String name,
                               String phone,
                               String address,
                               LocalDateTime createdAt,
                               List<String> roles) {
        return new MemberDTO(
            loginId,
            "", // pw 모르면 빈 문자열
            email,
            name,
            phone,
            address,
            createdAt,
            roles
        );
    }

    /** 토큰까지 한 번에 세팅하는 오버로드 */
    public static MemberDTO of(String loginId,
                               String email,
                               String name,
                               String phone,
                               String address,
                               LocalDateTime createdAt,
                               List<String> roles,
                               String accessToken,
                               String refreshToken) {
        MemberDTO dto = of(loginId, email, name, phone, address, createdAt, roles);
        dto.setAccessToken(accessToken);
        dto.setRefreshToken(refreshToken);
        return dto;
    }
}
