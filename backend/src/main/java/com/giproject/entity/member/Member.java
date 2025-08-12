package com.giproject.entity.member;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity
@Table(name = "Member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Member {
	
	@Id
	private String memId;
	private String memPw;
	private String memEmail;
	private String memName;
	private String memPhone;
	private String memAddress;
	private LocalDateTime memCreateIdDateTime;
	@Column(name = "profile_image")
	private String profileImage;
	
	
	
	public void changeMemPw(String memPw) {
		this.memPw = memPw;
	}
	
	public void changeMemAddress(String memAddress) {
		this.memAddress = memAddress;
		
	}
	
	public void changeMemPhone (String memPhone) {
		this.memPhone = memPhone;
	}
	
}