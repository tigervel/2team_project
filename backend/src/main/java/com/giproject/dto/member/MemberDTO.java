package com.giproject.dto.member;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MemberDTO extends User {

    private String memId;
    private String memPw;
    private String memEmail;
    private String memName;
    private String memPhone;
    private String memAddress;
    private LocalDateTime memCreateIdDateTime;
    private List<String> roleNames = new ArrayList<>();

    public MemberDTO(String memId, String memPw, String memEmail, String memName, String memPhone, String memAddress, LocalDateTime memCreateIdDateTime, List<String> rolenames) {
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

    public Map<String, Object> getClaims() {
        Map<String, Object> dataMap = new HashMap<>();

        dataMap.put("memId", memId);
        dataMap.put("memPw", memPw);
        dataMap.put("memEmail", memEmail);
        dataMap.put("memName", memName);
        dataMap.put("memPhone", memPhone);
        dataMap.put("memAddress", memAddress);
        dataMap.put("memCreateIdDateTime", memCreateIdDateTime);
        dataMap.put("rolenames", roleNames);

        return dataMap;
    }
}
