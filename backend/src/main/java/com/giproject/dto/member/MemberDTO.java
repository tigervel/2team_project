// src/main/java/com/giproject/dto/member/MemberDTO.java
package com.giproject.dto.member;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
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
@ToString(exclude = "memPw")
public class MemberDTO extends User {

    private static final long serialVersionUID = 1L;

    private String memId;
    @JsonIgnore
    private String memPw;

    private String memEmail;
    private String memName;
    private String memPhone;
    private String memAddress;
    private LocalDateTime memCreateIdDateTime;

    private List<String> roleNames = new ArrayList<>();

    private boolean social;
    private String provider;
    private String socialId;

    private String accessToken;
    private String refreshToken;

    // ===== 생성자 =====
    public MemberDTO(String memId,
                     String memPw,
                     String memEmail,
                     String memName,
                     String memPhone,
                     String memAddress,
                     LocalDateTime memCreateIdDateTime,
                     List<String> rolenames) {

        super(
            memId,
            (memPw == null ? "" : memPw),
            (rolenames == null ? List.<String>of() : rolenames).stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
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

    public MemberDTO(String memId,
                     String memPw,
                     boolean enabled,
                     boolean accountNonExpired,
                     boolean credentialsNonExpired,
                     boolean accountNonLocked,
                     Collection<? extends SimpleGrantedAuthority> authorities) {
        super(memId, (memPw == null ? "" : memPw),
              enabled, accountNonExpired, credentialsNonExpired, accountNonLocked, authorities);
        this.memId = memId;
        this.memPw = memPw;
    }

    // ===== 클레임 =====
    public Map<String, Object> getClaims() {
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("loginId", memId);
        dataMap.put("memId", memId);
        dataMap.put("memEmail", memEmail);
        dataMap.put("memName", memName);
        dataMap.put("memPhone", memPhone);
        dataMap.put("memAddress", memAddress);
        dataMap.put("memCreateIdDateTime", memCreateIdDateTime);
        dataMap.put("rolenames", roleNames);

        dataMap.put("social", social);
        if (provider != null) dataMap.put("provider", provider);
        if (socialId != null) dataMap.put("socialId", socialId);
        return dataMap;
    }

    // ===== 엔티티 변환 =====
    public static MemberDTO fromMember(com.giproject.entity.member.Member m, List<String> roles) {
        List<String> r = (roles == null || roles.isEmpty())
                ? new ArrayList<>(List.of("USER"))
                : new ArrayList<>(roles);

        try {
            if (m.getUserIndex() != null && m.getUserIndex().getRole() != null) {
                String domainRole = m.getUserIndex().getRole().name();
                if (domainRole != null && !domainRole.isBlank()) r.add(domainRole);
            }
        } catch (Exception ignore) {}

        MemberDTO dto = new MemberDTO(
            m.getMemId(),
            m.getMemPw(),
            m.getMemEmail(),
            m.getMemName(),
            m.getMemPhone(),
            m.getMemAddress(),
            m.getMemCreateIdDateTime(),
            r
        );

        dto.social = m.isSocial();
        try {
            if (m.getSocialAccount() != null) {
                dto.provider = String.valueOf(m.getSocialAccount().getProvider());
                dto.socialId = m.getSocialAccount().getProviderUserId();
                if (dto.memEmail == null && m.getSocialAccount().getEmail() != null) {
                    dto.memEmail = m.getSocialAccount().getEmail();
                }
            }
        } catch (Exception ignore) {}
        return dto;
    }

    public static MemberDTO fromMember(com.giproject.entity.member.Member m) {
        return fromMember(m, m.getMemberRoleList());
    }

    public String getSocialId() {
        return socialId;
    }

    // ===== Builder =====
    public static Builder newBuilder() { return new Builder(); }

    public static class Builder {
        private String loginId;
        private String password;
        private String email;
        private String name;
        private String phone;
        private String address;
        private LocalDateTime createdAt;

        private List<String> roles = new ArrayList<>();
        private boolean social;
        private String provider;
        private String socialId;

        private String accessToken;
        private String refreshToken;

        private Boolean enabled;
        private Boolean accountNonExpired;
        private Boolean credentialsNonExpired;
        private Boolean accountNonLocked;

        public Builder loginId(String v) { this.loginId = v; return this; }
        public Builder password(String v) { this.password = v; return this; }
        public Builder email(String v) { this.email = v; return this; }
        public Builder name(String v) { this.name = v; return this; }
        public Builder phone(String v) { this.phone = v; return this; }
        public Builder address(String v) { this.address = v; return this; }
        public Builder createdAt(LocalDateTime v) { this.createdAt = v; return this; }

        public Builder roles(Collection<String> rs) { if (rs != null) this.roles = new ArrayList<>(rs); return this; }
        public Builder addRole(String role) { if (role != null && !role.isBlank()) this.roles.add(role.trim()); return this; }
        public Builder role(String role) { return addRole(role); } // ✅ 단수 role 지원

        public Builder social(boolean v) { this.social = v; return this; }
        public Builder provider(String v) { this.provider = v; return this; }
        public Builder socialId(String v) { this.socialId = v; return this; }

        public Builder accessToken(String v) { this.accessToken = v; return this; }
        public Builder refreshToken(String v) { this.refreshToken = v; return this; }

        public Builder enabled(boolean v) { this.enabled = v; return this; }
        public Builder accountNonExpired(boolean v) { this.accountNonExpired = v; return this; }
        public Builder credentialsNonExpired(boolean v) { this.credentialsNonExpired = v; return this; }
        public Builder accountNonLocked(boolean v) { this.accountNonLocked = v; return this; }

        public MemberDTO build() {
            if (loginId == null || loginId.isBlank()) {
                throw new IllegalArgumentException("loginId(username) must not be blank");
            }

            var authorities = roles.stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            String pw = (password == null ? "" : password);

            MemberDTO dto;
            if (enabled != null || accountNonExpired != null || credentialsNonExpired != null || accountNonLocked != null) {
                dto = new MemberDTO(loginId, pw,
                        enabled == null ? true : enabled,
                        accountNonExpired == null ? true : accountNonExpired,
                        credentialsNonExpired == null ? true : credentialsNonExpired,
                        accountNonLocked == null ? true : accountNonLocked,
                        authorities);
                dto.memEmail = email;
                dto.memName = name;
                dto.memPhone = phone;
                dto.memAddress = address;
                dto.memCreateIdDateTime = createdAt;
                dto.roleNames = new ArrayList<>(roles);
            } else {
                dto = new MemberDTO(loginId, pw, email, name, phone, address, createdAt, new ArrayList<>(roles));
            }

            dto.social = this.social;
            dto.provider = this.provider;
            dto.socialId = this.socialId;
            dto.accessToken = this.accessToken;
            dto.refreshToken = this.refreshToken;
            return dto;
        }
    }

    public String getLoginId() { return memId; }
}
