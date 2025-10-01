import 'package:google_sign_in/google_sign_in.dart';
import 'package:kakao_flutter_sdk_user/kakao_flutter_sdk_user.dart' as kakao;
import 'package:flutter_naver_login/flutter_naver_login.dart';
import 'package:dio/dio.dart';

class SocialLoginService {
  final Dio dio = Dio(BaseOptions(baseUrl: "http://localhost:8080/api/auth"));

  Future<Map<String, dynamic>> loginWithGoogle() async {
    final googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);
    final account = await googleSignIn.signIn();
    final auth = await account?.authentication;

    final idToken = auth?.idToken;
    final email = account?.email;
    final name = account?.displayName;

    // ✅ 서버 호출
    final res = await dio.post("/social/login", data: {
      "provider": "GOOGLE",
      "providerId": account?.id,
      "email": email,
      "name": name,
    });
    return res.data;
  }

  Future<Map<String, dynamic>> loginWithKakao() async {
    if (!await kakao.isKakaoTalkInstalled()) {
      throw Exception("카카오톡 미설치");
    }
    final token = await kakao.UserApi.instance.loginWithKakaoTalk();
    final user = await kakao.UserApi.instance.me();

    final res = await dio.post("/social/login", data: {
      "provider": "KAKAO",
      "providerId": user.id.toString(),
      "email": user.kakaoAccount?.email,
      "name": user.kakaoAccount?.profile?.nickname,
    });
    return res.data;
  }

  Future<Map<String, dynamic>> loginWithNaver() async {
    final result = await FlutterNaverLogin.logIn();
    final account = result.account;

    final res = await dio.post("/social/login", data: {
      "provider": "NAVER",
      "providerId": account.id,
      "email": account.email,
      "name": account.name,
    });
    return res.data;
  }
}
