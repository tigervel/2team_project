import 'package:flutter/foundation.dart';
import 'package:flutter_naver_login/flutter_naver_login.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:kakao_flutter_sdk_user/kakao_flutter_sdk_user.dart' as kakao;
import 'package:dio/dio.dart';

import 'package:flutterproject/API/ApiConfig.dart';

class SocialLoginService {
  final Dio dio = Dio(BaseOptions(baseUrl: "${Apiconfig.baseUrl}/api/auth"));

  /// Google 로그인
  Future<Map<String, dynamic>> loginWithGoogle() async {
    final googleSignIn = GoogleSignIn(); // scopes 제거
    final account = await googleSignIn.signInSilently() ?? await googleSignIn.signIn();
    if (account == null) throw Exception("Google 로그인 취소됨");

    final auth = await account.authentication;
    final idToken = auth.idToken;        // ← 서버 검증용
    final accessToken = auth.accessToken; // 필요 시 함께 전송

    final providerId = account.id;
    final email = account.email;
    final name = account.displayName;

    if (providerId.isEmpty || email.isEmpty || (name == null || name.isEmpty)) {
      throw Exception("Google 로그인 실패: 필수 정보가 없습니다.");
    }

    final res = await dio.post(
      "/social/google",
      data: {"providerId": providerId, "email": email, "name": name, "idToken": idToken, "accessToken": accessToken, 
      },
      options: Options(headers: {"Content-Type": "application/json"}),
    );
    return res.data;
  }

  /// Kakao 로그인 (SDK에 scopes 파라미터가 없을 때의 호환 버전)
  Future<Map<String, dynamic>> loginWithKakao() async {
    // 기본 로그인
    if (await kakao.isKakaoTalkInstalled()) {
      await kakao.UserApi.instance.loginWithKakaoTalk();
    } else {
      await kakao.UserApi.instance.loginWithKakaoAccount();
    }

    // 프로필 조회
    final user = await kakao.UserApi.instance.me();
    final providerId = user.id?.toString();
    final email = user.kakaoAccount?.email;
    final name = user.kakaoAccount?.profile?.nickname;

    // 이메일이 없으면 서버에서 필수로 요구한다면 여기서 안내
    if (providerId == null || name == null || name.isEmpty) {
      throw Exception("Kakao 로그인 실패: 필수 정보가 없습니다.");
    }
    if (email == null || email.isEmpty) {
      // 선택1) 여기서 에러 처리(현재 백엔드가 email 필수라면)
      throw Exception("Kakao 로그인 실패: 이메일 권한이 없습니다. 카카오 동의 항목에서 이메일 제공에 동의해 주세요.");
      // 선택2) 백엔드가 email 없이도 진행 가능하면, 위 throw 대신 기본값/대체 흐름으로 처리
      // final fallbackEmail = "$providerId@kakao.user";
    }

    final res = await dio.post(
      "/social/kakao",
      data: {"providerId": providerId, "email": email, "name": name},
      options: Options(headers: {"Content-Type": "application/json"}),
    );
    return res.data;
  }

  /// Naver 로그인
  Future<Map<String, dynamic>> loginWithNaver() async {
    final result = await FlutterNaverLogin.logIn();
    final account = result.account;
    if (account == null) {
      throw Exception("Naver 로그인 실패: account 정보가 없습니다.");
    }

    final providerId = account.id;
    final email = account.email;
    final name = account.name ?? account.nickname;

    if (providerId == null || providerId.isEmpty) {
      throw Exception("Naver 로그인 실패: providerId가 없습니다.");
    }
    if (email == null || email.isEmpty) {
      throw Exception("Naver 로그인 실패: email이 없습니다.");
    }
    if (name == null || name.isEmpty) {
      throw Exception("Naver 로그인 실패: 이름 정보가 없습니다.");
    }

    final res = await dio.post(
      "/social/naver",
      data: {"providerId": providerId, "email": email, "name": name},
      options: Options(headers: {"Content-Type": "application/json"}),
    );
    return res.data;
  }
}
