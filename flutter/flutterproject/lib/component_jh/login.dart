// lib/pages/login_page.dart
import 'package:flutter/material.dart';
import 'package:flutterproject/Page/driverHomeEx.dart';
import 'package:flutterproject/Page/shipperHomeEx.dart';
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
  String? errorMsg;
  bool showPassword = false;

  void _login() async {
    setState(() {
      loading = true;
      errorMsg = null;
    });

    try {
      final data = await authService.login(
        _idController.text.trim(),
        _pwController.text.trim(),
      );

      await Storage.saveToken(data["token"]);
      _navigateByRole(data["roles"]);
    } catch (e) {
      setState(() {
        errorMsg = e.toString();
      });
    } finally {
      setState(() {
        loading = false;
      });
    }
  }

  void _socialLogin(String provider) async {
    setState(() {
      loading = true;
      errorMsg = null;
    });

    try {
      final data = await authService.socialLogin(provider);

      if (data.containsKey("signupTicket")) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => SignUpPage(
              socialEmail: "social@example.com", // 예시 이메일
              isSocial: true,
            ),
          ),
        );
      } else {
        await Storage.saveToken(data["token"]);
        _navigateByRole(data["roles"]);
      }
    } catch (e) {
      setState(() {
        errorMsg = e.toString();
      });
    } finally {
      setState(() {
        loading = false;
      });
    }
  }

  void _navigateByRole(List roles) {
    if (roles.contains("ROLE_SHIPPER")) {
      Navigator.pushReplacement(
          context, MaterialPageRoute(builder: (_) => const ShipperHome()));
    } else if (roles.contains("ROLE_DRIVER")) {
      Navigator.pushReplacement(
          context, MaterialPageRoute(builder: (_) => const DriverHome()));
    } else {
      setState(() {
        errorMsg = "허용되지 않은 역할입니다.";
      });
    }
  }

  @override
  void dispose() {
    _idController.dispose();
    _pwController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("로그인", style: TextStyle(color: Colors.white)), backgroundColor: Colors.indigo),
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
                    icon: Icon(showPassword ? Icons.visibility_off : Icons.visibility),
                    onPressed: () => setState(() { showPassword = !showPassword; }),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: loading ? null : _login,
                  child: loading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text("로그인"),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(onPressed: () {}, child: const Text("아이디 찾기")),
                  const SizedBox(width: 5),
                  TextButton(onPressed: () {}, child: const Text("비밀번호 찾기")),
                ],
              ),
              const SizedBox(height: 2),
              TextButton(
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const SignUpPage()));
                },
                child: const Text("회원가입", style: TextStyle(color: Colors.grey)),
              ),
              const Divider(thickness: 1),
              const SizedBox(height: 5),
              const Text("또는 소셜 로그인", style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 12),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(icon: Image.asset('assets/kakao-icon.png', width: 40), onPressed: () => _socialLogin("KAKAO")),
                    const SizedBox(width: 8),
                    IconButton(icon: Image.asset('assets/naver-icon.png', width: 40), onPressed: () => _socialLogin("NAVER")),
                    const SizedBox(width: 8),
                    IconButton(icon: Image.asset('assets/google-icon.png', width: 40), onPressed: () => _socialLogin("GOOGLE")),
                  ],
                ),
              ),
              if (errorMsg != null)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(errorMsg!, style: const TextStyle(color: Colors.red)),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
