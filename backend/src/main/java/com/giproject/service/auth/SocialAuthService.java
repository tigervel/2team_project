// com.giproject.service.auth
package com.giproject.service.auth;

import java.time.LocalDateTime;
import java.util.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import com.giproject.dto.auth.SocialLoginResult;
import com.giproject.dto.auth.SocialSignupCompleteRequest;
import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.entity.account.UserIndex;
import com.giproject.entity.account.UserIndex.Role;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.entity.oauth.SocialAccount;
import com.giproject.entity.oauth.SocialAccount.Provider;
import com.giproject.repository.oauth.SocialAccountRepo;
import com.giproject.repository.member.MemberRepository;
import com.giproject.repository.account.UserIndexRepo;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.dto.member.MemberDTO;
import com.giproject.dto.user.DtoConverters;

@Service
@RequiredArgsConstructor
public class SocialAuthService {

    private final SocialAccountRepo socialAccountRepo;
    private final UserIndexRepo userIndexRepo;
    private final MemberRepository memberRepo;
    private final CargoOwnerRepository cargoRepo;
    private final PasswordEncoder encoder;

    // ========= 1) 소셜 로그인 시작 =========
    @Transactional
    public SocialLoginResult startKakao(String kakaoUserId, String emailMaybe) {
        return startSocial(Provider.KAKAO, kakaoUserId, emailMaybe);
    }
    @Transactional
    public SocialLoginResult startNaver(String naverUserId, String emailMaybe) {
        return startSocial(Provider.NAVER, naverUserId, emailMaybe);
    }
    @Transactional
    public SocialLoginResult startGoogle(String googleSub, String emailMaybe) {
        return startSocial(Provider.GOOGLE, googleSub, emailMaybe);
    }

    private SocialLoginResult startSocial(Provider provider, String providerUserId, String emailMaybe) {
        var acc = socialAccountRepo.findByProviderAndProviderUserId(provider, providerUserId)
                .orElseGet(() -> socialAccountRepo.save(
                        SocialAccount.builder()
                                .provider(provider)
                                .providerUserId(providerUserId)
                                .email(emailMaybe)
                                .build()
                ));

        if (acc.getLoginId() != null) {
            // 이미 연결된 계정 → 프론트는 바로 로그인 처리
            return new SocialLoginResult(true, null, acc.getEmail());
        }

        // 미연결 → 가입완료 폼을 띄우기 위한 1회성 티켓 발급
        String ticket = UUID.randomUUID().toString();
        acc.setSignupTicket(ticket);
        acc.setSignupTicketExpireAt(LocalDateTime.now().plusMinutes(10));
        acc.setEmail(emailMaybe);
        socialAccountRepo.save(acc);

        return new SocialLoginResult(false, ticket, acc.getEmail());
    }

    // ========= 2) 가입 완료(사용자가 loginId 등 입력 후 호출) =========
    @Transactional
    public MemberDTO completeSignup(SocialSignupCompleteRequest req) {
        var acc = socialAccountRepo.findBySignupTicket(req.getTicket())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 티켓"));

        if (acc.getSignupTicketExpireAt() == null || acc.getSignupTicketExpireAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("티켓 만료");
        }
        if (acc.getLoginId() != null) {
            throw new IllegalStateException("이미 연결된 소셜 계정");
        }

        // 1) 전역 유니크 확보 (user_index)
        if (userIndexRepo.existsByLoginId(req.getLoginId())) {
            throw new IllegalArgumentException("이미 사용 중인 ID");
        }
        Role role = Role.valueOf(req.getRole()); // "SHIPPER" or "DRIVER"
        userIndexRepo.save(UserIndex.builder()
                .loginId(req.getLoginId())
                .role(role)
                .build());

        // 2) 역할별 본 테이블 insert
        switch (role) {
            case SHIPPER -> {
                var m = Member.builder()
                        .memId(req.getLoginId())
                        .memPw(encoder.encode(req.getPassword()))
                        .memEmail(req.getEmail())
                        .memName(req.getName())
                        .memPhone(req.getPhone())
                        .memAddress(req.getAddress())
                        .memCreateIdDateTime(LocalDateTime.now())
                        .build();
                memberRepo.save(m);
            }
            case DRIVER -> {
                var c = CargoOwner.builder()
                        .cargoId(req.getLoginId())
                        .cargoPw(encoder.encode(req.getPassword()))
                        .cargoEmail(req.getEmail())
                        .cargoName(req.getName())
                        .cargoPhone(req.getPhone())
                        .cargoAddress(req.getAddress())
                        .cargoCreatedDateTime(LocalDateTime.now())
                        .build();
                cargoRepo.save(c);
            }
        }

        // 3) 소셜 계정 ↔ 서비스 ID 연결
        acc.setLoginId(req.getLoginId());
        acc.setLinkedAt(LocalDateTime.now());
        acc.setSignupTicket(null);
        acc.setSignupTicketExpireAt(null);
        socialAccountRepo.save(acc);

        // 4) 최종 UserDTO 반환(로그인 처리용)
        //    반환 타입이 MemberDTO 이므로, DRIVER(화물주)인 경우도 MemberDTO로 변환해서 반환
        return (role == Role.SHIPPER)
                ? MemberDTO.fromMember(memberRepo.findByMemId(req.getLoginId()).orElseThrow(), null)
                // ★ FIX: CargoOwnerDTO -> MemberDTO 변환 추가
                : DtoConverters.toMemberDTO(
                        CargoOwnerDTO.fromCargoOwner(
                                cargoRepo.findByCargoId(req.getLoginId()).orElseThrow(),
                                null
                        )
                  );
    }
}
