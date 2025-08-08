package com.giproject.controller.common;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.common.UpdateUserDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;
import com.giproject.service.cargoowner.CargoOwnerService;
import com.giproject.service.member.MemberService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/g2i4/user")
@RequiredArgsConstructor
public class UserInfoController {

    private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;
    private final MemberService memberService;
    private final CargoOwnerService cargoOwnerService;


    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo(HttpSession session) {
        if (session.getAttribute("member") != null) {
            return ResponseEntity.ok(Map.of(
                "userType", "MEMBER",
                "data", memberService.getSessionUserInfo(session)
            ));
        } else if (session.getAttribute("cargoOwner") != null) {
            return ResponseEntity.ok(Map.of(
                "userType", "CARGO_OWNER",
                "data", cargoOwnerService.getSessionUserInfo(session)
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
    }
    
    @PutMapping("/user/update")
    public ResponseEntity<?> updateUser(@RequestBody UpdateUserDTO dto) {
        if ("MEMBER".equals(dto.getUserType())) {
            Member member = memberRepository.findById(dto.getId()).orElseThrow();
            member.setMemName(dto.getName());
            member.setMemAddress(dto.getAddress());
            memberRepository.save(member);
        } else if ("CARGO_OWNER".equals(dto.getUserType())) {
            CargoOwner owner = cargoOwnerRepository.findById(dto.getId()).orElseThrow();
            owner.setCargoName(dto.getName());
            owner.setCargoAddress(dto.getAddress());
            cargoOwnerRepository.save(owner);
        }
        return ResponseEntity.ok("수정 완료");
}
}