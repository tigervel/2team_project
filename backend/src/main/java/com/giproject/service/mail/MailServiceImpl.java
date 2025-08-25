package com.giproject.service.mail;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.member.Member;
import com.giproject.entity.order.OrderSheet;
import com.giproject.entity.payment.Payment;
import com.giproject.repository.matching.MatchingRepository;
import com.giproject.repository.payment.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService{
	private final JavaMailSender javaMailSender;
	private final MatchingRepository matchingRepository;
	private final PaymentRepository paymentRepository;
	
	@Override
	public void acceptedMail(Long mcno) {
		Matching matching = matchingRepository.findById(mcno).orElseThrow(() -> new RuntimeException("매칭번호가 존재하지 않습니다"));
		Estimate estimate = matching.getEstimate();
		Member member = estimate.getMember();
		String toEmail = member.getMemEmail();
		
		SimpleMailMessage message = new SimpleMailMessage();
		message.setTo(toEmail);
		message.setSubject("매칭이 수락되었습니다.");
		message.setText("매칭 번호 " + mcno + "가 수락되었습니다");
		message.setFrom("wjdgus2103@naver.com");
		
		javaMailSender.send(message);
		System.out.println("송부 완료!");
	}

	@Override
	public void paymentAcceptedMail(Long payno) {
		Payment payment = paymentRepository.findById(payno).orElseThrow(() -> new RuntimeException("결제번호가 존재하지 않습니다"));
		OrderSheet sheet = payment.getOrderSheet();
		Matching matching = sheet.getMatching();
		CargoOwner owner = matching.getCargoOwner();
		String toEmail = owner.getCargoEmail();
		
		SimpleMailMessage message = new SimpleMailMessage();
		message.setTo(toEmail);
		message.setSubject("수락하신 매칭이 결제 되었습니다");
		message.setText("수락하신 매칭 번호 " + matching.getMatchingNo() + "가  결제되었습니다");
		message.setFrom("wjdgus2103@naver.com");
		
		javaMailSender.send(message);
		System.out.println("송부 완료!"+toEmail+owner.getCargoName());
		
	}

}
