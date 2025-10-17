# 프로젝트 코드 제작 전 React Install
- material UI 핵심 패키지 설치(필수 3종)
- yarn add @mui/material @emotion/react @emotion/styled  
  
- Material UI 아이콘 설치
- yarn add @mui/icons-material

- React Router DOM (페이지 이동용)
- yarn add react-router-dom

- 전체 한 줄 설치 (처음부터 전체 설치 경우 해당)
- yarn add @mui/material @emotion/react @emotion/styled @mui/icons-material react-router-dom react react-dom

- Redux Install
- yarn add @reduxjs/toolkit react-redux 

- DATETIME 
- yarn add @mui/x-date-pickers@6.13.0 dayjs

- toolpad/core
- yarn add @toolpad/core

-axios
- yarn add axios

- Muterial Carousel
- yarn add react-material-ui-carousel@latest

## 👨‍👩‍👧‍👦 팀원 소개

| 이름   | 역할                                                   | GitHub |
| ------ | ------------------------------------------------------ | ------- |
| 문정현 | Fullstack Developer (회원가입/로그인/소셜 로그인)        | [GitHub 프로필](https://github.com/wjdgus2103) |
| 이재준 | Fullstack Developer (화주 마이페이지/차주 마이페이지)      | [GitHub 프로필]() |
| 임성훈 | Fullstack Developer (공지사항/Q&A 및 문의하기)     | [GitHub 프로필](https://github.com/flyEggr) |
| 주덕호 | Fullstack Developer (견적서/주문서 작성 및 결제/ 메인페이지)            | [GitHub 프로필](https://github.com/tigervel) |
| 최예지 | Fullstack Developer (관리자 페이지/운송료 조정/이용 통계)    | [GitHub 프로필](https://github.com/ooyeji) |


# 🚚 화물 운송 시스템 플랫폼 (Freight Logistics System)

> 화물주(고객)와 차주(운송업체)를 연결해주는 통합 운송 관리 플랫폼입니다.

---

## 📌 주요 기능

### 🔐 사용자 인증 및 보안
- 자체 로그인 / SNS 로그인
- 아이디 찾기, 비밀번호 재설정
- 회원가입 / 탈퇴
- 비밀번호 암호화 처리 (`bcrypt`)

### 👥 사용자 관리
- 회원 정보 수정 (주소, 비밀번호)
- 차량 정보 등록/수정 (차주용)
- 이용 내역 확인 / 배송 상태 확인
- 배송 완료 처리 및 평점 입력

### 📦 견적 및 결제
- 견적 요청: 거리/무게 기반 요금 산정
- 견적 송부: 조건에 맞는 차주에게 자동 전달
- 결제 처리: 결제 승인 및 금액 결제

### 🛠 관리자 기능
- 회원 제재 (신고 누적 / 수동 제재)
- 회원 조회
- 고객 문의 응답

### ⚙️ 기타
- 동시 접속 처리 지원
- 반응형 UI
- 사용자 권한 기반 기능 제한


## 📊 시스템 구성도

<details>
  <summary>🧭 프로세스 흐름도 보기 (클릭하여 펼치기)</summary>
  <br/>
  <img src="./docs/2teamproject.drawio (1).png" alt="프로세스 흐름도" width="800px"/>
</details>

<details>
  <summary>🗂️ ERD Cloud 보기 (클릭하여 펼치기)</summary>
  <br/>
  <img src="./docs/g2i4 (2).png" alt="ERD Cloud" width="800px"/>
</details>


## 🛠️ 사용 기술 (Tech Stack)

| 분야 | 사용 기술 |
|------|-----------|
| 백엔드 | Java, Spring Boot, JPA, Spring Security |
| 프론트엔드 | React, HTML/CSS |
| DB | MySQL |
| 외부 API | Kakao Map API, Kakao Navi API |
| 인증 | JWT, bcrypt |
| 형상 관리 | Git, GitHub |


## 📄 문서

- [요구사항 정의서 보기](./docs/요구사항정의서.md)
- [프로젝트 최종 보고서 보기](./docs/G2i4화물-운송-프로젝트_2조.pdf)

---

## 🌐 배포 주소 (Deployment)

- **웹 앱**: https://g2i4project.duckdns.org

## 📁 프로젝트 구조

```bash
freight-logistics-system/
├── backend/                # Spring Boot 기반 백엔드 서버
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/       # Java 코드
│   │   │   └── resources/  # 설정 파일 및 리소스
│   └── ...
├── frontend/               # React or Vue 프론트엔드
│   ├── src/
│   └── public/
├── docs/                   # 프로젝트 문서
│   ├── 요구사항정의서.md
│   ├── 2teamproject.drawio (1).png
│   └── g2i4 (2).png
└── README.md

