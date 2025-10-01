package com.giproject.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailVerificationService {

	// 메모리 저장소(운영은 Redis 권장)
    private final Map<String, Entry> store = new ConcurrentHashMap<>();
    private final Map<String, Boolean> verifiedEmails = new ConcurrentHashMap<>();
    private record Entry(String hash, long expiresAt, long lastSentAt, int sentCount) {}

    /* 보낸사람: 기본은 spring.mail.username, 필요하면 app.mail.from 로 덮어쓰기 */
    @Value("${app.mail.from:${spring.mail.username}}")
    private String from;

    private final JavaMailSender mailSender;
    private final SecureRandom random = new SecureRandom();

    public EmailVerificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /** 인증코드 전송 */
    public void sendCode(String email) {
        long now = Instant.now().toEpochMilli();
        Entry prev = store.get(email);

        if (prev != null) {
            if (now - prev.lastSentAt < 60_000) throw new IllegalArgumentException("너무 자주 요청했습니다.");
            if (prev.sentCount >= 5 && now - prev.lastSentAt < 3_600_000)
                throw new IllegalArgumentException("한 시간 요청 한도 초과");
        }

        String code = String.format("%06d", random.nextInt(1_000_000));
        String hash = BCrypt.hashpw(code, BCrypt.gensalt());
        long expiresAt = Instant.now().plusSeconds(10 * 60).toEpochMilli(); // 10분

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(email);
        msg.setSubject("[GiProject] 이메일 인증코드");
        msg.setText("인증코드: " + code + "\n유효시간: 10분");
        mailSender.send(msg);

        int newCount = prev == null ? 1 : Math.min(prev.sentCount + 1, 10);
        store.put(email, new Entry(hash, expiresAt, now, newCount));
    }

    /** 인증코드 검증(일회성) */
    public boolean verify(String email, String code) {
        Entry entry = store.get(email);
        if (entry == null || Instant.now().toEpochMilli() > entry.expiresAt) {
            store.remove(email);
            return false;
        }
        boolean ok = BCrypt.checkpw(code, entry.hash);
        if (ok) {
            store.remove(email);
            verifiedEmails.put(email, true);
        }
        return ok;
    }

    public boolean isVerified(String email) {
        return verifiedEmails.getOrDefault(email, false);
    }
}
