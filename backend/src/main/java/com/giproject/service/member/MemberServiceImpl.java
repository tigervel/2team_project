package com.giproject.service.member;

import com.giproject.dto.common.UserResponseDTO;
import com.giproject.dto.member.MemberDTO;
import com.giproject.entity.member.Member;
import com.giproject.repository.member.MemberRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleOAuthService googleOAuthService;

    private String makeTempPassword() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append((char) ((int) (Math.random() * 55) + 65));
        }
        return sb.toString();
    }

    private Member makeSocialMember(String email) {
        String tempPass = makeTempPassword();
        String nickName = email.split("@")[0];

        return Member.builder()
                .memId(UUID.randomUUID().toString())
                .memEmail(email)
                .memPw(passwordEncoder.encode(tempPass))
                .memName(nickName)
                .memCreateIdDateTime(LocalDateTime.now())
                .social(true)
                .build();
    }

    @Override
    public UserResponseDTO getSessionUserInfo(HttpSession session) {
        Member member = (Member) session.getAttribute("member");
        return new UserResponseDTO(
                member.getMemId(),
                member.getMemName(),
                member.getMemEmail(),
                member.getMemPhone(),
                member.getMemAddress(),
                member.getMemCreateIdDateTime()
        );
    }

    @Override
    public MemberDTO getKakaoMember(String accessToken) {
        String email = getEmailFromKakaoAccessToken(accessToken);
        log.info("Kakao Email: " + email);

        Optional<Member> existing = memberRepository.findFirstByMemEmail(email);

        Member member;
        if (existing.isPresent()) {
            member = existing.get();
        } else {
            member = makeSocialMember(email);
            memberRepository.save(member);
        }

        return entityToDTO(member);
    }

    private String getEmailFromKakaoAccessToken(String accessToken) {
        if (accessToken == null) throw new RuntimeException("Access Token is NULL");

        String url = "https://kapi.kakao.com/v2/user/me";

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        headers.add("Content-Type", "application/x-www-form-urlencoded");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        UriComponents uriComponents = UriComponentsBuilder.fromHttpUrl(url).build();

        ResponseEntity<LinkedHashMap> response = restTemplate.exchange(
                uriComponents.toString(),
                HttpMethod.GET,
                entity,
                LinkedHashMap.class
        );

        LinkedHashMap<String, LinkedHashMap> bodyMap = response.getBody();
        LinkedHashMap<String, String> kakaoAccount = bodyMap.get("kakao_account");

        return kakaoAccount.get("email");
    }

    @Override
    public MemberDTO getNaverMember(String accessToken) {
        if (accessToken == null) throw new RuntimeException("Access Token is NULL");

        String url = "https://openapi.naver.com/v1/nid/me";
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<LinkedHashMap> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, LinkedHashMap.class
        );

        LinkedHashMap<String, Object> bodyMap = response.getBody();
        if (bodyMap == null || !"success".equals(bodyMap.get("resultcode"))) {
            throw new RuntimeException("네이버 사용자 정보 조회 실패");
        }

        LinkedHashMap<String, Object> respMap = (LinkedHashMap<String, Object>) bodyMap.get("response");
        String email = (String) respMap.get("email");
        String name = (String) respMap.get("name");
        String phone = (String) respMap.get("mobile");

        Optional<Member> existing = memberRepository.findFirstByMemEmail(email);

        Member member;
        if (existing.isPresent()) {
            member = existing.get();
        } else {
            member = Member.builder()
                    .memId(UUID.randomUUID().toString())
                    .memEmail(email)
                    .memName(name)
                    .memPhone(phone)
                    .memPw(passwordEncoder.encode(makeTempPassword()))
                    .memCreateIdDateTime(LocalDateTime.now())
                    .social(true)
                    .build();
            memberRepository.save(member);
        }

        return entityToDTO(member);
    }

    @Override
    public MemberDTO getGoogleMember(String accessToken) {
        Map<String, Object> profile = googleOAuthService.getUserProfile(accessToken);
        String email = (String) profile.get("email");
        String name = (String) profile.get("name");

        Member member = memberRepository.findFirstByMemEmail(email)
                .orElseGet(() -> memberRepository.save(
                        Member.builder()
                                .memId(UUID.randomUUID().toString())
                                .memEmail(email)
                                .memName(name)
                                .social(true)
                                .memCreateIdDateTime(LocalDateTime.now())
                                .build()
                ));

        return entityToDTO(member);
    }

    @Override
    public boolean isIdAvailable(String memId) {
        if (memId == null || memId.isBlank()) return false;
        return !memberRepository.existsById(memId.trim());
    }

    @Override
    public MemberDTO registerMember(MemberDTO dto) {
        Member member = Member.builder()
                .memId(UUID.randomUUID().toString())
                .memEmail(dto.getMemEmail())
                .memPw(passwordEncoder.encode(dto.getMemPw()))
                .memName(dto.getMemName())
                .memPhone(dto.getMemPhone())
                .memAddress(dto.getMemAddress())
                .memCreateIdDateTime(LocalDateTime.now())
                .social(false)
                .build();

        Member saved = memberRepository.save(member);
        return entityToDTO(saved);
    }
}
