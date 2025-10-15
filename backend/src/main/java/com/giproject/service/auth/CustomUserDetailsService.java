package com.giproject.service.auth;

import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.dto.member.MemberDTO;
import com.giproject.entity.account.UserIndex;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.repository.account.UserIndexRepository;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Log4j2
public class CustomUserDetailsService implements UserDetailsService {

    private final UserIndexRepository userIndexRepo;
    private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var idx = userIndexRepo.findByLoginId(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        return switch (idx.getRole()) {
            case SHIPPER, ADMIN -> {
                Member m = memberRepository.findByMemId(username)
                        .orElseThrow(() -> new UsernameNotFoundException("화주 정보 없음: " + username));
                yield MemberDTO.fromMember(m);
            }
            case DRIVER -> {
                CargoOwner c = cargoOwnerRepository.findByCargoId(username)
                        .orElseThrow(() -> new UsernameNotFoundException("차주 정보 없음: " + username));
                yield CargoOwnerDTO.fromCargoOwner(c);
            }
        };
    }
}
