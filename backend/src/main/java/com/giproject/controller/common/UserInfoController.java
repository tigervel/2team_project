package com.giproject.controller.common;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
    
//    @PutMapping("/update")
//    public ResponseEntity<?> updateUser(@RequestBody UpdateUserDTO dto) {
//        if ("MEMBER".equals(dto.getUserType())) {
//            Member member = memberRepository.findById(dto.getId()).orElseThrow();
//            member.setMemName(dto.getName());
//            member.setMemAddress(dto.getAddress());
//            memberRepository.save(member);
//        } else if ("CARGO_OWNER".equals(dto.getUserType())) {
//            CargoOwner owner = cargoOwnerRepository.findById(dto.getId()).orElseThrow();
//            owner.setCargoName(dto.getName());
//            owner.setCargoAddress(dto.getAddress());
//            cargoOwnerRepository.save(owner);
//        }
//        return ResponseEntity.ok("수정 완료");
//    }  
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("image") MultipartFile file,
            @RequestParam("userType") String userType,
            @RequestParam("id") String id) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("파일이 없습니다.");
        }

        try {
            // 저장 경로
            String uploadDir = "C:/upload/user_profile/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            // 파일명 생성
            String originalFilename = file.getOriginalFilename();
            String ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
            String savedFilename = UUID.randomUUID().toString() + ext;

            // 저장
            Path path = Paths.get(uploadDir + savedFilename);
            Files.write(path, file.getBytes());

            // DB 저장
            if ("MEMBER".equals(userType)) {
                Member member = memberRepository.findById(id).orElseThrow();
                //member.setProfileImage(savedFilename);
                memberRepository.save(member);
            } else if ("CARGO_OWNER".equals(userType)) {
                CargoOwner owner = cargoOwnerRepository.findById(id).orElseThrow();
                owner.setProfileImage(savedFilename);
                cargoOwnerRepository.save(owner);
            } else {
                return ResponseEntity.badRequest().body("userType이 잘못되었습니다.");
            }

            return ResponseEntity.ok(Map.of("filename", savedFilename));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("업로드 실패: " + e.getMessage());
        }
    }
}