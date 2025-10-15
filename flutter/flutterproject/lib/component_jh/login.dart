// lib/component_jh/login.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:flutterproject/Page/main_page.dart';
import 'package:flutterproject/component_jh/signup.dart';
import 'package:flutterproject/provider/TokenProvider.dart';
import 'package:flutterproject/provider/UserProvider.dart';

import 'package:flutterproject/services/auth_service.dart';
import 'package:flutterproject/services/social_login_service.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _idController = TextEditingController();
  final _pwController = TextEditingController();

  final authService = AuthService();
  final socialService = SocialLoginService();

  bool loading = false;
  bool showPassword = false;
  String? errorMsg;

  void _setLoading(bool v) => setState(() => loading = v);

  @override
  void dispose() {
    _idController.dispose();
    _pwController.dispose();
    super.dispose();
  }

  // -------------------- 일반 로그인 --------------------
  Future<void> _login() async {
    _setLoading(true);
    setState(() => errorMsg = null);

    try {
      final data = await authService.login(
        _idController.text.trim(),
        _pwController.text.trim(),
      );

      final token = data["accessToken"] as String?;
      if (token == null || token.isEmpty) {
        setState(() => errorMsg = "로그인 토큰이 없습니다.");
        return;
      }

      // 토큰 Provider 반영
      await context.read<Tokenprovider>().setToken(token);

      // 프로필 로드 → UserProvider 반영
      final profile = await authService.getProfile();
      if (!mounted) return;
      context.read<UserProvider>().setUser(profile);

      // 성공 이동
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => MainPage()),
        (_) => false,
      );
    } catch (e) {
      setState(() => errorMsg = e.toString());
    } finally {
      if (mounted) _setLoading(false);
    }
  }

  // -------------------- 소셜 로그인 --------------------
  Future<void> _socialLogin(String provider) async {
    _setLoading(true);
    setState(() => errorMsg = null);

    try {
      late Map<String, dynamic> data;

      switch (provider.toUpperCase()) {
        case "GOOGLE":
          data = await socialService.loginWithGoogle();
          break;
        case "KAKAO":
          data = await socialService.loginWithKakao();
          break;
        case "NAVER":
          data = await socialService.loginWithNaver();
          break;
        default:
          throw Exception("지원하지 않는 소셜 로그인입니다.");
      }

      // 첫 소셜 로그인: 추가 정보 필요
      final signupTicket = data["signupTicket"] as String?;
      if (signupTicket != null && signupTicket.isNotEmpty) {
        if (!mounted) return;
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => SignUpPage(
              socialEmail: data["email"] as String?,
              isSocial: true,
              signupTicket: signupTicket,
            ),
          ),
        );
        return;
      }

      // 토큰 즉시 발급 케이스
      final token = data["accessToken"] as String?;
      if (token == null || token.isEmpty) {
        setState(() => errorMsg = "로그인 토큰이 없습니다.");
        return;
      }

      await context.read<Tokenprovider>().setToken(token);

      // 프로필 로드 → UserProvider 반영
      final profile = await authService.getProfile();
      if (!mounted) return;
      context.read<UserProvider>().setUser(profile);

      // 성공 이동
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => MainPage()),
        (_) => false,
      );
    } catch (e) {
      setState(() => errorMsg = e.toString());
    } finally {
      if (mounted) _setLoading(false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isBusy = loading;

    return Scaffold(
      appBar: AppBar(
        title: const Text("로그인", style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.indigo,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              TextField(
                controller: _idController,
                enabled: !isBusy,
                decoration: const InputDecoration(labelText: "아이디"),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _pwController,
                enabled: !isBusy,
                obscureText: !showPassword,
                decoration: InputDecoration(
                  labelText: "비밀번호",
                  suffixIcon: IconButton(
                    onPressed: isBusy
                        ? null
                        : () => setState(() => showPassword = !showPassword),
                    icon: Icon(
                      showPassword ? Icons.visibility_off : Icons.visibility,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 48,
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: isBusy ? null : _login,
                  child: isBusy
                      ? const SizedBox(
                          width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text("로그인"),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: isBusy
                    ? null
                    : () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const SignUpPage()),
                        ),
                child: const Text("회원가입", style: TextStyle(color: Colors.grey)),
              ),

              const SizedBox(height: 8),
              const Divider(),
              const SizedBox(height: 8),
              const Text("또는 소셜 로그인", style: TextStyle(color: Colors.grey)),

              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Kakao
                  IconButton(
                    icon: Image.asset('assets/kakao-icon.png', width: 40),
                    onPressed: isBusy ? null : () => _socialLogin("KAKAO"),
                    tooltip: "카카오로 계속하기",
                  ),
                  // Naver
                  IconButton(
                    icon: Image.asset('assets/naver-icon.png', width: 40),
                    onPressed: isBusy ? null : () => _socialLogin("NAVER"),
                    tooltip: "네이버로 계속하기",
                  ),
                  // Google
                  IconButton(
                    icon: Image.asset('assets/google-icon.png', width: 40),
                    onPressed: isBusy ? null : () => _socialLogin("GOOGLE"),
                    tooltip: "Google로 계속하기",
                  ),
                ],
              ),

              if (errorMsg != null) ...[
                const SizedBox(height: 12),
                Text(errorMsg!, style: const TextStyle(color: Colors.red)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
