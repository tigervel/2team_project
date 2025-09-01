// src/main/java/com/giproject/repository/account/UserIndexRepo.java
package com.giproject.repository.account;

import com.giproject.entity.account.UserIndex;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserIndexRepo extends JpaRepository<UserIndex, String> {

    // 로그인 ID
    boolean existsByLoginId(String loginId);
    Optional<UserIndex> findByLoginId(String loginId);

    // 이메일 (대소문자 무시)
    boolean existsByEmailIgnoreCase(String email);
    Optional<UserIndex> findByEmailIgnoreCase(String email);

    // 소셜 프로바이더 + 프로바이더 사용자 ID (예: GOOGLE + sub, KAKAO + id)
    boolean existsByProviderAndProviderId(String provider, String providerId);
    Optional<UserIndex> findByProviderAndProviderId(String provider, String providerId);
}
