package com.giproject.service.auth;

import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.dto.member.MemberDTO;
import com.giproject.entity.account.UserIndex;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.repository.account.UserIndexRepo;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomUserDetailsService implements UserDetailsService {
  private final UserIndexRepo userIndexRepo;
  private final MemberRepository memberRepository;
  private final CargoOwnerRepository cargoOwnerRepository;

  @Override
  public UserDetails loadUserByUsername(String username) {
    var idx = userIndexRepo.findByLoginId(username)
        .orElseThrow(() -> new UsernameNotFoundException("사용자 없음: " + username));

    return switch (idx.getRole()) {
      case SHIPPER, ADMIN -> memberRepository.findByMemId(username)
          .map(MemberDTO::fromMember)
          .orElseThrow(() -> new UsernameNotFoundException("화주/관리자 정보 없음: " + username));
      case DRIVER -> cargoOwnerRepository.findByCargoId(username)
          .map(CargoOwnerDTO::fromCargoOwner)
          .orElseThrow(() -> new UsernameNotFoundException("차주 정보 없음: " + username));
    };
  }
}