package com.giproject.service.auth;

import static com.giproject.security.jwt.JwtClaimKeys.*;

import com.giproject.dto.auth.SignupRequest;
import com.giproject.dto.member.MemberDTO;
import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.entity.account.UserIndex;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.repository.account.UserIndexRepository;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;
import com.giproject.security.JwtService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SimpleSignupService {

    private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;
    private final UserIndexRepository userIndexRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public boolean existsByLoginId(String loginId) {
        return userIndexRepo.existsByLoginId(loginId);
    }

    @Transactional
    public Object signup(SignupRequest req) {
        final String loginId = safeTrim(req.getLoginId());
        final String email = normalizeEmail(safeTrim(req.getEmail()));
        final String rawPw = req.getPassword();
        final String roleStr = safeTrim(req.getRole());

        if (isBlank(loginId)) throw new IllegalArgumentException("LOGIN_ID_REQUIRED");
        if (isBlank(rawPw)) throw new IllegalArgumentException("PASSWORD_REQUIRED");
        if (isBlank(email)) throw new IllegalArgumentException("EMAIL_REQUIRED");
        if (isBlank(roleStr)) throw new IllegalArgumentException("ROLE_REQUIRED");

        final UserIndex.Role domainRole;
        try {
            domainRole = UserIndex.Role.valueOf(roleStr.toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("INVALID_ROLE");
        }

        if (userIndexRepo.existsByLoginId(loginId)) throw new IllegalArgumentException("LOGIN_ID_TAKEN");
        if (userIndexRepo.existsByEmail(email)) throw new IllegalArgumentException("EMAIL_TAKEN");

        final LocalDateTime now = LocalDateTime.now();
        userIndexRepo.save(UserIndex.builder()
                .loginId(loginId)
                .email(email)
                .provider("LOCAL")
                .providerId(loginId)
                .role(domainRole)
                .createdAt(now)
                .updatedAt(now)
                .build());

        final String enc = passwordEncoder.encode(rawPw);
        final String name = req.getName();
        final String phone = req.getPhone();
        final String address = req.getAddress();

        Object dto;
        switch (domainRole) {
            case SHIPPER, ADMIN -> {
                Member m = Member.builder()
                        .memId(loginId)
                        .memPw(enc)
                        .memEmail(email)
                        .memName(name)
                        .memPhone(phone)
                        .memAddress(address)
                        .social(false)
                        .memCreateIdDateTime(now)
                        .build();
                memberRepository.save(m);
                dto = MemberDTO.fromMember(m);
            }
            case DRIVER -> {
                CargoOwner c = CargoOwner.builder()
                        .cargoId(loginId)
                        .cargoPw(enc)
                        .cargoEmail(email)
                        .cargoName(name)
                        .cargoPhone(phone)
                        .cargoAddress(address)
                        .social(false)
                        .cargoCreatedDateTime(now)
                        .build();
                cargoOwnerRepository.save(c);
                dto = CargoOwnerDTO.fromCargoOwner(c);
            }
            default -> throw new IllegalArgumentException("UNSUPPORTED_ROLE");
        }

        List<String> roles = new ArrayList<>();
        roles.add("ROLE_" + domainRole.name());
        if (domainRole == UserIndex.Role.ADMIN) roles.add("ROLE_ADMIN");
        else roles.add("ROLE_USER");

        Map<String, Object> claims = new HashMap<>();
        claims.put(EMAIL, email);
        claims.put(UID, loginId);
        claims.put(ROLES, roles);
        claims.put(PROVIDER, "LOCAL");
        claims.put(PROVIDER_ID, loginId);

        String access  = jwtService.createAccessToken(claims, loginId);
        String refresh = jwtService.createRefreshToken(Map.of(UID, loginId), loginId);

        if (dto instanceof CargoOwnerDTO cDto) cDto.withTokens(access, refresh);
        else if (dto instanceof MemberDTO mDto) mDto.withTokens(access, refresh);

        return dto;
    }

    private static String safeTrim(String s) { return s == null ? null : s.trim(); }
    private static boolean isBlank(String s) { return s == null || s.isBlank(); }
    private static String normalizeEmail(String email) { return email == null ? null : email.trim().toLowerCase(Locale.ROOT); }
}
