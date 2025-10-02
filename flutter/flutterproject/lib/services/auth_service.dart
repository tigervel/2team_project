import 'dart:convert';
import 'package:flutterproject/API/ApiConfig.dart';
import 'package:flutterproject/Utils/storage.dart';
import 'package:http/http.dart' as http;

class AuthService {
  final String baseUrl = '${Apiconfig.baseUrl}/api';

  // -------------------- 로그인 --------------------
  Future<Map<String, dynamic>> login(String loginId, String password) async {
    final res = await http.post(
      Uri.parse("$baseUrl/auth/login"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"loginId": loginId, "password": password}),
    );

    return _handleResponse(
      res,
      successCallback: (body) async {
        final accessToken = body["accessToken"] as String?;
        final refreshToken = body["refreshToken"] as String?;

        if (accessToken == null || accessToken.isEmpty) {
          throw Exception("로그인은 성공했지만 accessToken이 없습니다.");
        }

        await Storage.saveToken(accessToken);
        if (refreshToken != null) await Storage.saveRefreshToken(refreshToken);
      },
    );
  }

  // -------------------- 회원가입 --------------------
  Future<Map<String, dynamic>> register({
    required String loginId,
    required String password,
    required String email,
    required String name,
    required String phone,
    required String address,
    String? detailAddress,
    String? carNumber,
    required String userType, // "화주" or "차주"
  }) async {
    final role = userType == "화주" ? "SHIPPER" : "DRIVER";

    final res = await http.post(
      Uri.parse("$baseUrl/auth/signup"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "loginId": loginId,
        "password": password,
        "email": email,
        "name": name,
        "phone": phone,
        "address": address,
        "detailAddress": detailAddress,
        "carNumber": carNumber,
        "role": role,
      }),
    );

    return _handleResponse(
      res,
      successCallback: (body) async {
        final accessToken = body["accessToken"] as String?;
        final refreshToken = body["refreshToken"] as String?;
        if (accessToken != null) await Storage.saveToken(accessToken);
        if (refreshToken != null) await Storage.saveRefreshToken(refreshToken);
      },
    );
  }

  // -------------------- 소셜 로그인 --------------------
  Future<Map<String, dynamic>> socialLogin(String provider) async {
    final res = await http.post(
      Uri.parse("$baseUrl/auth/social/$provider"),
      headers: {"Content-Type": "application/json"},
    );
    return _handleResponse(res);
  }

  // -------------------- 소셜 회원가입 완료 --------------------
  Future<Map<String, dynamic>> completeSocialSignup({
    required String signupTicket,
    required String role,
    required String loginId,
    required String password,
    required String name,
    required String phone,
    required String address,
    String? detailAddress,
    String? carNumber,
  }) async {
    final res = await http.post(
      Uri.parse("$baseUrl/auth/social/complete-signup"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "signupTicket": signupTicket,
        "role": role,
        "loginId": loginId,
        "password": password,
        "name": name,
        "phone": phone,
        "address": address,
        "detailAddress": detailAddress,
        "carNumber": carNumber,
      }),
    );

    return _handleResponse(
      res,
      successCallback: (body) async {
        final accessToken = body["accessToken"] as String?;
        final refreshToken = body["refreshToken"] as String?;
        if (accessToken != null) await Storage.saveToken(accessToken);
        if (refreshToken != null) await Storage.saveRefreshToken(refreshToken);
      },
    );
  }

  // -------------------- 프로필 조회 --------------------
  Future<Map<String, dynamic>> getProfile() async {
    final token = await Storage.getToken();
    if (token == null || token.isEmpty) {
      throw Exception("저장된 토큰이 없습니다.");
    }

    final res = await http.get(
      Uri.parse("${Apiconfig.baseUrl}/g2i4/user/info"),
      headers: {"Authorization": "Bearer $token"},
    );

    return _handleResponse(
      res,
      unauthorizedCallback: () async {
        await Storage.removeToken();
        throw Exception("토큰이 만료되었거나 유효하지 않습니다.");
      },
    );
  }

  // -------------------- ID 중복 확인 --------------------
  Future<bool> checkIdDuplicate(String loginId) async {
    final res = await http.get(
      Uri.parse("$baseUrl/auth/check-id?loginId=$loginId"),
    );
    final body = jsonDecode(res.body);
    if (res.statusCode == 200) {
      return body["available"] as bool? ?? false;
    } else {
      final message = body["message"] ?? "ID 중복 확인 실패";
      throw Exception(message);
    }
  }

  // -------------------- 이메일 인증 --------------------
  Future<void> sendEmailCode(String email) async {
    final res = await http.post(
      Uri.parse("$baseUrl/email/send-code"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email}),
    );

    if (res.statusCode != 200) {
      final body = jsonDecode(res.body);
      final message = body["message"] ?? "인증코드 전송 실패";
      throw Exception(message);
    }
  }

  Future<bool> verifyEmailCode(String email, String code) async {
    final res = await http.post(
      Uri.parse("$baseUrl/email/verify"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email, "code": code}),
    );

    final body = jsonDecode(res.body);
    if (res.statusCode == 200) {
      return body["verified"] as bool? ?? false;
    } else {
      final message = body["message"] ?? "인증코드 검증 실패";
      throw Exception(message);
    }
  }

  /// -------------------- 공통 응답 처리 --------------------
  Future<Map<String, dynamic>> _handleResponse(
    http.Response res, {
    Future<void> Function(Map<String, dynamic> body)? successCallback,
    Future<void> Function()? unauthorizedCallback,
  }) async {
    final body = jsonDecode(res.body);
    if (res.statusCode == 200) {
      if (successCallback != null) await successCallback(body);
      return body;
    } else if (res.statusCode == 401) {
      if (unauthorizedCallback != null) await unauthorizedCallback();
      throw Exception(body["message"] ?? "인증 실패");
    } else {
      throw Exception(body["message"] ?? "요청 실패: ${res.statusCode}");
    }
  }
}
