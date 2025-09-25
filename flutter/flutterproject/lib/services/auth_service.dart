import 'dart:async';

class AuthService {
  Future<Map<String, dynamic>> login(String loginId, String password) async {
    await Future.delayed(const Duration(seconds: 1));
    if (loginId == "shipper" && password == "1234") {
      return {
        "token": "mock_jwt_shipper",
        "roles": ["ROLE_SHIPPER"],
      };
    } else if (loginId == "driver" && password == "1234") {
      return {
        "token": "mock_jwt_driver",
        "roles": ["ROLE_DRIVER"],
      };
    } else {
      throw Exception("로그인 실패: 아이디 또는 비밀번호 오류");
    }
  }

  Future<Map<String, dynamic>> socialLogin(String provider) async {
    await Future.delayed(const Duration(seconds: 1));
    if (provider == "KAKAO") {
      return {
        "signupTicket": "VALID_TICKET",
      };
    } else {
      return {
        "token": "mock_jwt_driver",
        "roles": ["ROLE_DRIVER"],
      };
    }
  }

  Future<Map<String, dynamic>> completeSocialSignup({
    required String signupTicket,
    required String role,
    required String loginId,
    required String password,
    required String name,
    required String phone,
    required String address,
  }) async {
    await Future.delayed(const Duration(seconds: 1));
    if (signupTicket != "VALID_TICKET") {
      throw Exception("유효하지 않은 소셜 가입 티켓");
    }

    return {
      "token": "mock_jwt_${role.toLowerCase()}",
      "roles": [role == "SHIPPER" ? "ROLE_SHIPPER" : "ROLE_DRIVER"],
    };
  }

  // 일반 회원가입(register) 메서드
  Future<Map<String, dynamic>> register({
    required String loginId,
    required String password,
    required String email,
    required String name,
    required String phone,
    required String address,
    String? detailAddress,
    String? carNumber,
    required String userType,
  }) async {
    await Future.delayed(const Duration(seconds: 1));
    final existingIds = ["test01", "user123"];
    if (existingIds.contains(loginId)) {
      throw Exception("이미 사용 중인 아이디입니다.");
    }
    final role = userType == "화주" ? "ROLE_SHIPPER" : "ROLE_DRIVER";
    return {
      "token": "mock_jwt_${role.toLowerCase()}",
      "roles": [role],
    };
  }
}
