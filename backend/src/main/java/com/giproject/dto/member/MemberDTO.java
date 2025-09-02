// src/main/java/com/giproject/dto/member/MemberDTO.java
package com.giproject.dto.member;

import java.time.LocalDateTime;
import java.util.*;
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

    private String memId;

    @JsonIgnore
    private String memPw; // 직렬화 방지(안전)

    private String memEmail;
    private String memName;
    private String memPhone;
    private String memAddress;
    private LocalDateTime memCreateIdDateTime;

    /** 권한 이름(예: "USER","ADMIN"). Spring Security 권한은 생성자에서 "ROLE_" 접두 처리 */
    private List<String> roleNames = new ArrayList<>();

    /** 🔽 소셜 로그인 관련(있으면 세팅) */
    private String provider;  // "KAKAO" | "NAVER" | "GOOGLE" | null
    private String socialId;  // 각 제공자 고유 식별자(카카오 id, 네이버 id, 구글 sub 등)

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
            memPw,
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
        // 필요 시 다음도 포함 가능
        if (provider != null) dataMap.put("provider", provider);
        if (socialId != null) dataMap.put("socialId", socialId);
        return dataMap;
    }

    /** 엔티티 → DTO 변환 (roles 전달) */
    public static MemberDTO fromMember(com.giproject.entity.member.Member m, List<String> roles) {
        List<String> r = (roles == null || roles.isEmpty())
                ? new ArrayList<>(List.of("USER"))
                : new ArrayList<>(roles);

        // 도메인 역할(예: 화주/차주) 자동 포함해 인가 편의 제공
        try {
            if (m.getUserIndex() != null && m.getUserIndex().getRole() != null) {
                r.add(m.getUserIndex().getRole().name());
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
        // 프로젝트 구현에 따라 m.getMemberRoleList() 가 List<String>이라고 가정
        return fromMember(m, m.getMemberRoleList());
    }

    /** 소셜 제공자 고유 식별자 반환 (카카오 id / 네이버 id / 구글 sub 등) */
    public String getSocialId() {
        return socialId;
    }
}
