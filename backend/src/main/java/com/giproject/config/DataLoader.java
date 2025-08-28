package com.giproject.config;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.giproject.entity.noboard.Notice;
import com.giproject.entity.qaboard.AuthorType;
import com.giproject.entity.qaboard.QACategory;
import com.giproject.entity.qaboard.QAPost;
import com.giproject.repository.noboard.NoticeRepository;
import com.giproject.repository.qaboard.QAPostRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final QAPostRepository qaPostRepository;
    private final NoticeRepository noticeRepository;
    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        // MySQL 운영 DB에서도 테스트 데이터가 필요한 경우 활성화
        // QAPost 더미 데이터 생성 (기존 데이터가 없을 때만)
        if (qaPostRepository.count() == 0) {
            createQAPostDummyData();
        }
        
        // Notice 더미 데이터 생성 (기존 데이터가 없을 때만)
        if (noticeRepository.count() == 0) {
            createNoticeDummyData();
        }
    }

    /**
     * QAPost 더미 데이터 25개 생성 (카테고리별로 분산)
     */
    private void createQAPostDummyData() {
        if (qaPostRepository.count() > 0) {
            System.out.println("QAPost 더미 데이터가 이미 존재합니다.");
            return;
        }

        QACategory[] categories = QACategory.values();
        AuthorType[] authorTypes = {AuthorType.MEMBER, AuthorType.CARGO, AuthorType.ADMIN};
        
        String[] userIds = {"user001", "user002", "user003", "cargo001", "cargo002", "admin001"};
        String[] userNames = {"김화물", "이운송", "박배송", "차주김", "차주이", "관리자"};

        for (int i = 1; i <= 25; i++) {
            QACategory category = categories[i % categories.length];
            AuthorType authorType = authorTypes[i % authorTypes.length];
            int userIndex = i % userIds.length;
            
            QAPost qaPost = QAPost.builder()
                .title(generateQATitle(category, i))
                .content(generateQAContent(category, i))
                .category(category)
                .isPrivate(i % 7 == 0) // 7번째마다 비공개
                .authorId(userIds[userIndex])
                .authorName(userNames[userIndex])
                .authorType(authorType)
                .viewCount(random.nextInt(100) + 1)
                .build();

            qaPostRepository.save(qaPost);
        }

        System.out.println("QAPost 더미 데이터 25개 생성 완료");
    }

    /**
     * Notice 더미 데이터 25개 생성
     */
    private void createNoticeDummyData() {
        if (noticeRepository.count() > 0) {
            System.out.println("Notice 더미 데이터가 이미 존재합니다.");
            return;
        }

        String[] adminIds = {"admin001", "admin002", "admin003"};
        String[] adminNames = {"시스템관리자", "운영관리자", "고객관리자"};

        for (int i = 1; i <= 25; i++) {
            int adminIndex = i % adminIds.length;
            
            Notice notice = Notice.builder()
                .title(generateNoticeTitle(i))
                .content(generateNoticeContent(i))
                .authorId(adminIds[adminIndex])
                .authorName(adminNames[adminIndex])
                .viewCount(random.nextInt(200) + 10)
                .build();

            noticeRepository.save(notice);
        }

        System.out.println("Notice 더미 데이터 25개 생성 완료");
    }

    /**
     * QA 게시글 제목 생성
     */
    private String generateQATitle(QACategory category, int index) {
        switch (category) {
            case GENERAL:
                return String.format("[일반문의] %s", getGeneralTitles()[index % getGeneralTitles().length]);
            case TECHNICAL:
                return String.format("[기술지원] %s", getTechnicalTitles()[index % getTechnicalTitles().length]);
            case BILLING:
                return String.format("[결제/요금] %s", getBillingTitles()[index % getBillingTitles().length]);
            case SERVICE:
                return String.format("[서비스이용] %s", getServiceTitles()[index % getServiceTitles().length]);
            case ETC:
                return String.format("[기타] %s", getEtcTitles()[index % getEtcTitles().length]);
            default:
                return String.format("QA 문의 %d번", index);
        }
    }

    /**
     * QA 게시글 내용 생성
     */
    private String generateQAContent(QACategory category, int index) {
        String baseContent = switch (category) {
            case GENERAL -> "안녕하세요. 서비스 이용 중 궁금한 사항이 있어서 문의드립니다.\n\n";
            case TECHNICAL -> "기술적인 문제가 발생하여 도움을 요청드립니다.\n\n";
            case BILLING -> "결제 및 요금과 관련하여 문의사항이 있습니다.\n\n";
            case SERVICE -> "서비스 이용 방법에 대해 질문이 있습니다.\n\n";
            case ETC -> "기타 문의사항이 있어 연락드립니다.\n\n";
        };
        
        return baseContent + 
               "상세 내용:\n" +
               "- 문제 발생 시점: " + LocalDateTime.now().minusDays(random.nextInt(30)) + "\n" +
               "- 이용 환경: 웹 브라우저 (Chrome/Safari/Firefox)\n" +
               "- 추가 설명: " + generateRandomDescription() + "\n\n" +
               "빠른 답변 부탁드립니다.\n감사합니다.";
    }

    /**
     * 공지사항 제목 생성
     */
    private String generateNoticeTitle(int index) {
        String[] noticeTitles = {
            "서비스 이용약관 개정 안내",
            "정기 시스템 점검 예정 공지",
            "새로운 결제 시스템 도입 안내", 
            "고객센터 운영시간 변경 공지",
            "화물 운송료 요금표 업데이트",
            "모바일 앱 새로운 기능 추가",
            "개인정보처리방침 변경 안내",
            "추석 연휴 고객센터 운영 안내",
            "신규 화물주 가입 이벤트",
            "차주 등록 절차 간소화 안내",
            "실시간 배송 추적 서비스 오픈",
            "고객 만족도 조사 실시 안내",
            "보안 강화를 위한 비밀번호 정책 변경",
            "겨울철 운송 안전 수칙 안내",
            "긴급 연락처 변경 공지",
            "서비스 품질 향상을 위한 시스템 업그레이드",
            "새해 인사 및 운영 계획",
            "고객 혜택 프로그램 런칭",
            "화물 분류 기준 업데이트",
            "운송업 관련 법규 변경 안내",
            "고객 데이터 보호 정책 강화",
            "24시간 고객센터 운영 시작",
            "친환경 운송 서비스 도입",
            "AI 기반 최적 경로 서비스 베타 오픈",
            "연말정산 관련 서류 발급 안내"
        };
        
        return noticeTitles[index % noticeTitles.length];
    }

    /**
     * 공지사항 내용 생성
     */
    private String generateNoticeContent(int index) {
        String[] contentTemplates = {
            "안녕하세요. 화물 운송 플랫폼을 이용해 주시는 고객 여러분께 감사드립니다.\n\n" +
            "서비스 개선을 위해 다음과 같은 변경사항을 안내드립니다:\n\n" +
            "■ 주요 변경 내용\n" +
            "- 사용자 인터페이스 개선\n" +
            "- 결제 시스템 안정성 향상\n" +
            "- 실시간 배송 추적 기능 강화\n\n" +
            "■ 적용 일정\n" +
            "- 사전 공지: " + LocalDateTime.now().plusDays(7) + "\n" +
            "- 실제 적용: " + LocalDateTime.now().plusDays(14) + "\n\n" +
            "기타 문의사항이 있으시면 고객센터로 연락 부탁드립니다.\n" +
            "감사합니다.",

            "화물 운송 플랫폼 이용고객 여러분께 안내말씀 드립니다.\n\n" +
            "보다 나은 서비스 제공을 위해 시스템 점검을 실시하고자 합니다.\n\n" +
            "■ 점검 일정\n" +
            "- 점검 날짜: " + LocalDateTime.now().plusDays(random.nextInt(30)) + "\n" +
            "- 점검 시간: 오전 2시 ~ 오전 6시 (약 4시간)\n" +
            "- 영향 범위: 전체 서비스 일시 중단\n\n" +
            "■ 점검 내용\n" +
            "- 서버 안정성 향상\n" +
            "- 데이터베이스 최적화\n" +
            "- 보안 업데이트 적용\n\n" +
            "점검 시간 중에는 서비스 이용이 제한됩니다.\n" +
            "양해 부탁드리며, 더욱 안정적인 서비스로 찾아뵙겠습니다.",

            "고객 여러분께 중요한 변경사항을 안내드립니다.\n\n" +
            "서비스 품질 향상과 사용자 편의성 증대를 위해\n" +
            "새로운 기능을 추가하게 되었습니다.\n\n" +
            "■ 새로운 기능\n" +
            "- 스마트 경로 추천 시스템\n" +
            "- 실시간 요금 계산기\n" +
            "- 화물 상태 알림 서비스\n" +
            "- 모바일 최적화 인터페이스\n\n" +
            "■ 이용 방법\n" +
            "기존과 동일하게 이용하시면 자동으로 새로운 기능이 적용됩니다.\n" +
            "별도의 설정이나 업데이트는 필요하지 않습니다.\n\n" +
            "더 나은 서비스로 보답하겠습니다.\n" +
            "감사합니다."
        };
        
        return contentTemplates[index % contentTemplates.length];
    }

    /**
     * 랜덤 설명 생성
     */
    private String generateRandomDescription() {
        String[] descriptions = {
            "브라우저에서 특정 기능이 동작하지 않습니다",
            "화면 로딩이 느려지는 현상이 발생합니다", 
            "결제 진행 중 오류가 발생했습니다",
            "로그인이 되지 않는 문제가 있습니다",
            "견적서 작성 시 오류 메시지가 나타납니다",
            "배송 상태가 업데이트되지 않습니다",
            "알림 메시지가 수신되지 않습니다",
            "프로필 정보 수정이 안됩니다",
            "검색 기능이 정상 작동하지 않습니다",
            "이미지 업로드가 실패합니다"
        };
        
        return descriptions[random.nextInt(descriptions.length)];
    }

    // QA 카테고리별 제목 배열들
    private String[] getGeneralTitles() {
        return new String[]{
            "서비스 이용 방법 문의",
            "회원가입 절차 질문",
            "요금 체계에 대한 설명 요청",
            "배송 지역 확인 문의",
            "운송 가능 화물 종류 질문"
        };
    }

    private String[] getTechnicalTitles() {
        return new String[]{
            "웹사이트 로딩 오류 신고", 
            "모바일 앱 접속 불가",
            "결제 화면 오류 발생",
            "로그인 기능 장애",
            "이미지 업로드 실패 문제"
        };
    }

    private String[] getBillingTitles() {
        return new String[]{
            "운송료 계산 방식 문의",
            "결제 취소 요청 방법",
            "세금계산서 발급 문의", 
            "할인 혜택 적용 문의",
            "결제 오류 환불 요청"
        };
    }

    private String[] getServiceTitles() {
        return new String[]{
            "차주 등록 방법 안내 요청",
            "화물 등록 절차 질문",
            "배송 추적 서비스 이용법",
            "고객센터 연락 방법",
            "서비스 해지 절차 문의"
        };
    }

    private String[] getEtcTitles() {
        return new String[]{
            "개인정보 수정 방법",
            "비밀번호 재설정 문의",
            "서비스 개선 제안",
            "파트너십 협력 문의", 
            "언론 보도 관련 문의"
        };
    }
}