import 'package:flutter/material.dart';
import 'package:flutterproject/Page/main_page.dart';
import 'package:flutterproject/component_jh/signup.dart';
import '../services/auth_service.dart';
import '../utils/storage.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _idController = TextEditingController();
  final _pwController = TextEditingController();
  final authService = AuthService();
  bool loading = false;
  bool showPassword = false;
  String? errorMsg;

  // -------------------- 일반 로그인 --------------------
  void _login() async {
    setState(() {
      loading = true;
      errorMsg = null;
    });

    try {
      final data = await authService.login(_idController.text.trim(), _pwController.text.trim());

      // 로그인 후 토큰 저장
      final token = data["accessToken"] as String?;
      if (token != null) {
        await Storage.saveToken(token);

        // 프로필 호출
        final profile = await authService.getProfile();
        print("로그인 완료, 프로필: $profile");

        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const MainPage()),
          );
        }
      } else {
        setState(() {
          errorMsg = "로그인 토큰이 없습니다.";
        });
      }
    } catch (e) {
      setState(() {
        errorMsg = e.toString();
      });
    } finally {
      setState(() => loading = false);
    }
  }

  // -------------------- 소셜 로그인 --------------------
  void _socialLogin(String provider) async {
    setState(() {
      loading = true;
      errorMsg = null;
    });

    try {
      final data = await authService.socialLogin(provider);

      // 회원가입이 필요한 경우
      if (data.containsKey("signupTicket")) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => SignUpPage(
              socialEmail: data["email"] as String?,
              isSocial: true,
              signupTicket: data["signupTicket"] as String?,
            ),
          ),
        );
      } else {
        // 바로 로그인 처리
        final token = data["accessToken"] as String?;
        if (token != null) {
          await Storage.saveToken(token);

          final profile = await authService.getProfile();
          print("소셜 로그인 완료, 프로필: $profile");

          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const MainPage()),
            );
          }
        } else {
          setState(() {
            errorMsg = "로그인 토큰이 없습니다.";
          });
        }
      }
    } catch (e) {
      setState(() {
        errorMsg = e.toString();
      });
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
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
                decoration: const InputDecoration(labelText: "아이디"),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _pwController,
                obscureText: !showPassword,
                decoration: InputDecoration(
                  labelText: "비밀번호",
                  suffixIcon: IconButton(
                    icon: Icon(
                      showPassword ? Icons.visibility_off : Icons.visibility,
                    ),
                    onPressed: () => setState(() => showPassword = !showPassword),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: loading ? null : _login,
                child: loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("로그인"),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SignUpPage()),
                ),
                child: const Text("회원가입", style: TextStyle(color: Colors.grey)),
              ),
              const Divider(),
              const Text("또는 소셜 로그인", style: TextStyle(color: Colors.grey)),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    icon: Image.asset('assets/kakao-icon.png', width: 40),
                    onPressed: () => _socialLogin("KAKAO"),
                  ),
                  IconButton(
                    icon: Image.asset('assets/naver-icon.png', width: 40),
                    onPressed: () => _socialLogin("NAVER"),
                  ),
                  IconButton(
                    icon: Image.asset('assets/google-icon.png', width: 40),
                    onPressed: () => _socialLogin("GOOGLE"),
                  ),
                ],
              ),
              if (errorMsg != null)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(
                    errorMsg!,
                    style: const TextStyle(color: Colors.red),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
