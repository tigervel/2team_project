package com.giproject.entity.oauth;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "social_account", uniqueConstraints = @UniqueConstraint(columnNames = {"provider","provider_user_id"}))
@Getter
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class SocialAccount {

    public enum Provider { KAKAO, NAVER, GOOGLE }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Provider provider;

    @Column(name = "provider_user_id", nullable = false, length = 128)
    private String providerUserId;   // 카카오 id, 네이버 id, 구글 sub 등

    @Column(name = "email")          // 프로바이더가 준 이메일(있으면 보관)
    private String email;

    @Column(name = "login_id")       // 우리 서비스의 로그인 ID(사용자 지정). 연결 전까지 null
    private String loginId;

    @Column(name = "linked_at")
    private LocalDateTime linkedAt;

    // 가입 완료 폼용 1회성 티켓 (간단 구현)
    @Column(name = "signup_ticket", length = 64)
    private String signupTicket;

    @Column(name = "signup_ticket_expire_at")
    private LocalDateTime signupTicketExpireAt;
}
