import 'package:flutterproject/API/ApiConfig.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:kakao_flutter_sdk_user/kakao_flutter_sdk_user.dart' as kakao;
import 'package:flutter_naver_login/flutter_naver_login.dart';
import 'package:dio/dio.dart';

class SocialLoginService {
  final Dio dio = Dio(BaseOptions(baseUrl: "${Apiconfig.baseUrl}/api/auth"));

  /// Google 로그인
  Future<Map<String, dynamic>> loginWithGoogle() async {
    final googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);
    final account = await googleSignIn.signIn();

    if (account == null) throw Exception("Google 로그인 취소됨");

    final providerId = account.id;
    final email = account.email;
    final name = account.displayName;

    if (providerId == null || email == null || name == null || name.isEmpty) {
      throw Exception("Google 로그인 실패: 필수 정보가 없습니다.");
    }

    final res = await dio.post(
      "/social/google",
      data: {"providerId": providerId, "email": email, "name": name},
      options: Options(headers: {"Content-Type": "application/json"}),
    );

    return res.data;
  }

  /// Kakao 로그인
  Future<Map<String, dynamic>> loginWithKakao() async {
    kakao.OAuthToken token;
    if (await kakao.isKakaoTalkInstalled()) {
      token = await kakao.UserApi.instance.loginWithKakaoTalk();
    } else {
      token = await kakao.UserApi.instance.loginWithKakaoAccount();
    }

    final user = await kakao.UserApi.instance.me();
    final providerId = user.id?.toString();
    final email = user.kakaoAccount?.email;
    final name = user.kakaoAccount?.profile?.nickname;

    if (providerId == null || email == null || name == null || name.isEmpty) {
      throw Exception("Kakao 로그인 실패: 필수 정보가 없습니다.");
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

    if (providerId == null || providerId.isEmpty) throw Exception("Naver 로그인 실패: providerId가 없습니다.");
    if (email == null || email.isEmpty) throw Exception("Naver 로그인 실패: email이 없습니다.");
    if (name == null || name.isEmpty) throw Exception("Naver 로그인 실패: 이름 정보가 없습니다.");

    final res = await dio.post(
      "/social/naver",
      data: {"providerId": providerId, "email": email, "name": name},
      options: Options(headers: {"Content-Type": "application/json"}),
    );

    return res.data;
  }
}
