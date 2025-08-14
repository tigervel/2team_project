package com.giproject.entity.member;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "member") // 소문자 권장
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
@ToString(exclude = "memberRoleList")
public class Member {

	@Id
    @Column(name = "mem_id", length = 50, nullable = false)
    private String memId;

	@Column(name = "mem_email")
	private String memEmail;

	@Column(name = "mem_pw")
	private String memPw;

	@Column(name = "mem_name")
	private String memName;

 	@Column(name = "mem_phone")
 	private String memPhone;

 	@Column(name = "mem_address")
 	private String memAddress;

 	@Column(name = "mem_create_id_datetime")
 	private java.time.LocalDateTime memCreateIdDateTime;

 	@ElementCollection(fetch = FetchType.LAZY)
  	@CollectionTable(name = "member_roles",
      	joinColumns = @JoinColumn(name = "mem_id"))
 	@Column(name = "role")
 	@Builder.Default
 	private java.util.List<String> memberRoleList = new java.util.ArrayList<>();

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



