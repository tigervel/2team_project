// com.giproject.service.auth.SimpleSignupService.java
package com.giproject.service.auth;

import com.giproject.dto.auth.SignupRequest;
import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.dto.member.MemberDTO;
import com.giproject.dto.user.DtoConverters;
import com.giproject.entity.account.UserIndex;
import com.giproject.entity.account.UserIndex.Role;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.repository.account.UserIndexRepo;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SimpleSignupService {

    private final UserIndexRepo userIndexRepo;
    private final MemberRepository memberRepo;
    private final CargoOwnerRepository cargoRepo;
    private final PasswordEncoder encoder;

    // 로그인ID 존재여부 조회 (중복확인용)
    @Transactional(readOnly = true)
    public boolean existsByLoginId(String loginId) {
        return userIndexRepo.existsByLoginId(loginId);
    }
    
    @Transactional
    public MemberDTO signup(SignupRequest req) {
        // role: "SHIPPER"(화주) | "DRIVER"(차주)
        Role role = Role.valueOf(req.getRole());
        String loginId = req.getLoginId();

        // 전역 유니크 검사
        if (userIndexRepo.existsByLoginId(loginId)) {
            throw new IllegalArgumentException("이미 사용 중인 ID입니다.");
        }

        // user_index 등록
        userIndexRepo.save(UserIndex.builder()
                .loginId(loginId)
                .role(role)
                .build());

        // 역할별 DB insert
        switch (role) {
            case SHIPPER -> {
                Member m = Member.builder()
                        .memId(loginId)
                        .memPw(encoder.encode(req.getPassword()))
                        .memEmail(req.getEmail())
                        .memName(req.getName())
                        .memPhone(req.getPhone())
                        .memAddress(req.getAddress())
                        .memCreateIdDateTime(LocalDateTime.now())
                        .build();
                memberRepo.save(m);

                return MemberDTO.fromMember(
                        memberRepo.findByMemId(loginId).orElseThrow(),
                        null
                );
            }
            case DRIVER -> {
                CargoOwner c = CargoOwner.builder()
                        .cargoId(loginId)
                        .cargoPw(encoder.encode(req.getPassword()))
                        .cargoEmail(req.getEmail())
                        .cargoName(req.getName())
                        .cargoPhone(req.getPhone())
                        .cargoAddress(req.getAddress())
                        .cargoCreatedDateTime(LocalDateTime.now())
                        .build();
                cargoRepo.save(c);

                return DtoConverters.toMemberDTO(
                        CargoOwnerDTO.fromCargoOwner(
                                cargoRepo.findByCargoId(loginId).orElseThrow(),
                                null
                        )
                );
            }
        }
        throw new IllegalStateException("지원하지 않는 역할");
    }
}
