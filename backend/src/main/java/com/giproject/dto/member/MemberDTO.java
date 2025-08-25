package com.giproject.dto.member;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    private String memId;
    @JsonIgnore
    private String memPw; // 직렬화 방지(안전)
    private String memEmail;
    private String memName;
    private String memPhone;
    private String memAddress;
    private LocalDateTime memCreateIdDateTime;
    private List<String> roleNames = new ArrayList<>();

    public MemberDTO(String memId, String memPw, String memEmail, String memName, String memPhone,
                     String memAddress, LocalDateTime memCreateIdDateTime, List<String> rolenames) {

        super(
            memId,
            memPw,
            rolenames.stream()
                     .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                     .collect(Collectors.toList())
        );

        this.memId = memId;
        this.memPw = memPw;
        this.memEmail = memEmail;
        this.memName = memName;
        this.memPhone = memPhone;
        this.memAddress = memAddress;
        this.memCreateIdDateTime = memCreateIdDateTime;
        this.roleNames = rolenames;
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
        dataMap.put("rolenames", roleNames);
        return dataMap;
    }

    /** 엔티티 → DTO 변환 (roles 전달) */
    public static MemberDTO fromMember(com.giproject.entity.member.Member m, List<String> roles) {
        List<String> r = (roles == null || roles.isEmpty())
                ? new ArrayList<>(List.of("USER"))
                : new ArrayList<>(roles);
        // 도메인 역할(화주) 자동 포함해 인가 편의 제공
        if (m.getUserIndex() != null && m.getUserIndex().getRole() != null) {
            r.add(m.getUserIndex().getRole().name());
        }

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
}
