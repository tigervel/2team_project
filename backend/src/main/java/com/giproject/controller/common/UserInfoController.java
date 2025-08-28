package com.giproject.controller.common;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/g2i4/user")
@RequiredArgsConstructor
public class UserInfoController {

    private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;

    // 업로드 루트 (윈도우)
    private static final Path UPLOAD_ROOT = Paths.get("D:", "2team_Project_Git", "uploads");
    private static final String USER_PROFILE_SUBDIR = "user_profile";

    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "UNAUTHORIZED"));
        }

        final String userId = auth.getName();

        // MEMBER 먼저
        Member m = memberRepository.findById(userId).orElse(null);
        if (m != null) {
            String fileName = m.getProfileImage(); // null 가능
            String webPath  = (fileName == null || fileName.isBlank())
                    ? null
                    : "/g2i4/uploads/user_profile/" + fileName;

            var data = new java.util.LinkedHashMap<String,Object>();
            data.put("mem_id", m.getMemId());
            data.put("mem_name", m.getMemName());
            data.put("mem_email", m.getMemEmail());
            data.put("mem_phone", m.getMemPhone());                // null OK
            data.put("mem_address", m.getMemAddress());            // null OK
            data.put("mem_create_id_date_time", m.getMemCreateIdDateTime());
            data.put("profileImage", fileName);                    // null OK
            data.put("webPath", webPath);                          // null OK

            var body = new java.util.LinkedHashMap<String,Object>();
            body.put("userType", "MEMBER");
            body.put("data", data);
            return ResponseEntity.ok(body);
        }

        // CARGO_OWNER
        CargoOwner c = cargoOwnerRepository.findById(userId).orElse(null);
        if (c != null) {
            String fileName = c.getProfileImage();
            String webPath  = (fileName == null || fileName.isBlank())
                    ? null
                    : "/g2i4/uploads/user_profile/" + fileName;

            var data = new java.util.LinkedHashMap<String,Object>();
            data.put("cargo_id", c.getCargoId());
            data.put("cargo_name", c.getCargoName());
            data.put("cargo_email", c.getCargoEmail());
            data.put("cargo_phone", c.getCargoPhone());
            data.put("cargo_address", c.getCargoAddress());
            // 엔티티에 있는 정확한 getter로 맞춰주세요.
            data.put("cargo_created_datetime", c.getCargoCreatedDateTime());
            data.put("profileImage", fileName);
            data.put("webPath", webPath);

            var body = new java.util.LinkedHashMap<String,Object>();
            body.put("userType", "CARGO_OWNER");
            body.put("data", data);
            return ResponseEntity.ok(body);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new java.util.LinkedHashMap<String,Object>() {{
                    put("error", "NOT_FOUND");
                }});
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("image") MultipartFile file,
            @RequestParam("userType") String userType,
            @RequestParam("id") String id) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("파일이 없습니다.");
        }

        try {
            // 디렉토리 보장
            Path dir = UPLOAD_ROOT.resolve(USER_PROFILE_SUBDIR);
            Files.createDirectories(dir);

            // 저장 파일명
            String original = file.getOriginalFilename();
            String ext = (original != null && original.lastIndexOf('.') != -1)
                    ? original.substring(original.lastIndexOf('.')).toLowerCase()
                    : "";
            String savedFilename = UUID.randomUUID() + ext;

            // 저장
            Path savePath = dir.resolve(savedFilename);
            file.transferTo(savePath.toFile());

            // DB 반영
            if ("MEMBER".equalsIgnoreCase(userType)) {
                Member m = memberRepository.findById(id).orElseThrow();
                m.setProfileImage(savedFilename);
                memberRepository.save(m);
            } else if ("CARGO_OWNER".equalsIgnoreCase(userType)) {
                CargoOwner c = cargoOwnerRepository.findById(id).orElseThrow();
                c.setProfileImage(savedFilename);
                cargoOwnerRepository.save(c);
            } else {
                return ResponseEntity.badRequest().body("userType이 잘못되었습니다.");
            }

            // 프론트 미리보기용 경로
            String webPath = "/g2i4/uploads/" + USER_PROFILE_SUBDIR + "/" + savedFilename;
            return ResponseEntity.ok(Map.of("filename", savedFilename, "webPath", webPath));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("업로드 실패: " + e.getMessage());
        }
    }

    @DeleteMapping("/profile-image")
    public ResponseEntity<?> deleteProfileImage(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error","UNAUTHORIZED"));
        }

        final String userId = auth.getName();
        String filename = null;

        // MEMBER
        Member m = memberRepository.findById(userId).orElse(null);
        if (m != null) {
            filename = m.getProfileImage();
            m.setProfileImage(null);
            memberRepository.save(m);
        } else {
            // CARGO_OWNER
            CargoOwner c = cargoOwnerRepository.findById(userId).orElse(null);
            if (c != null) {
                filename = c.getProfileImage();
                c.setProfileImage(null);
                cargoOwnerRepository.save(c);
            }
        }

        // 파일 삭제(있으면)
        if (filename != null && !filename.isBlank()) {
            try {
                Files.deleteIfExists(UPLOAD_ROOT.resolve(USER_PROFILE_SUBDIR).resolve(filename));
            } catch (Exception ignore) {}
        }

        return ResponseEntity.ok(Map.of("removed", true));
    }
}
