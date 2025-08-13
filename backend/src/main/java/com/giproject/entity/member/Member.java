package com.giproject.entity.member;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Member") // 첫번째 코드에 있었음
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "memberRoleList") // 첫번째 코드에 있었던 toString exclude 반영
public class Member {

    // 일반 로그인 ID
    @Id
    @Column(length = 50)
    private String memId;

    // 소셜 로그인 이메일 (중복 불가)
    @Column(unique = true, length = 100)
    private String memEmail;

    // 비밀번호
    private String memPw;

    // 이름
    private String memName;

    // 전화번호 (첫번째 코드에만 있음)
    private String memPhone;

    // 주소 (첫번째 코드에만 있음)
    private String memAddress;

    // 생성일시 (첫번째 코드에서는 필드명이 memCreateIdDateTime, 두번째 코드도 동일)
    private LocalDateTime memCreateIdDateTime;

    // 권한 목록
    @ElementCollection(fetch = FetchType.LAZY)
    @Builder.Default
    private List<String> memberRoleList = new ArrayList<>();
    
    private boolean social;

    // ===== 권한 메서드 =====
    public void addRole(String role) {
        if (!this.memberRoleList.contains(role)) {
            this.memberRoleList.add(role);
        }
    }

    public void clearRole() {
        this.memberRoleList.clear();
    }

    // ===== 정보 수정 메서드 =====
    public void changeMemPw(String memPw) {
        this.memPw = memPw;
    }

    public void changeMemAddress(String memAddress) {
        this.memAddress = memAddress;
    }

    public void changeMemPhone(String memPhone) {
        this.memPhone = memPhone;
    }
}



