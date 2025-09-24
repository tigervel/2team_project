import 'package:flutter/material.dart';
import 'home.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _idController = TextEditingController();
  final _pwController = TextEditingController();

  bool showPassword = false;
  String alignment = 'user'; // user=화주, car=차주
  bool saveId = false; // 아이디 저장
  bool autoLogin = false; // 자동 로그인
  final _formKey = GlobalKey<FormState>();

  void _login() {
    if (_formKey.currentState!.validate()) {
      String id = _idController.text.trim();
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) =>
              HomePage(id: id, role: alignment == 'user' ? '화주' : '차주'),
        ),
      );
      debugPrint("아이디 저장: $saveId, 자동 로그인: $autoLogin");
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
      backgroundColor: Colors.grey[100],
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 500, minWidth: 300),
            child: Card(
              elevation: 3,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Center(
                        child: Text(
                          '로그인',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.indigo,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // 화주 / 차주 선택
                      Center(
                        child: ToggleButtons(
                          borderRadius: BorderRadius.circular(12),
                          selectedColor: Colors.white,
                          fillColor: Colors.indigo,
                          color: Colors.indigo,
                          isSelected: [alignment == 'user', alignment == 'car'],
                          onPressed: (index) {
                            setState(() {
                              alignment = index == 0 ? 'user' : 'car';
                            });
                          },
                          children: const [
                            Padding(
                              padding: EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 8,
                              ),
                              child: Text("화주"),
                            ),
                            Padding(
                              padding: EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 8,
                              ),
                              child: Text("차주"),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 30),

                      // ID 입력
                      TextFormField(
                        controller: _idController,
                        decoration: InputDecoration(
                          labelText: "아이디",
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return '아이디를 입력해주세요';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // 비밀번호 입력
                      TextFormField(
                        controller: _pwController,
                        obscureText: !showPassword,
                        decoration: InputDecoration(
                          labelText: "비밀번호",
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(
                              showPassword
                                  ? Icons.visibility_off
                                  : Icons.visibility,
                            ),
                            onPressed: () {
                              setState(() {
                                showPassword = !showPassword;
                              });
                            },
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return '비밀번호를 입력해주세요';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          TextButton(
                            onPressed: () {
                              debugPrint("아이디 찾기 클릭");
                            },
                            child: const Text(
                              "아이디 찾기",
                              style: TextStyle(color: Colors.indigo),
                            ),
                          ),
                          const SizedBox(width: 8), // 버튼 사이 간격
                          TextButton(
                            onPressed: () {
                              debugPrint("비밀번호 찾기 클릭");
                            },
                            child: const Text(
                              "비밀번호 찾기",
                              style: TextStyle(color: Colors.indigo),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // 로그인 버튼
                      SizedBox(
                        height: 55,
                        child: ElevatedButton(
                          onPressed: _login,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.indigo,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            "로그인",
                            style: TextStyle(fontSize: 18, color: Colors.white),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // 회원가입 이동 버튼
                      TextButton(
                        onPressed: () {
                          Navigator.pushNamed(context, '/signup');
                        },
                        child: const Text(
                          '회원가입',
                          style: TextStyle(color: Colors.indigo),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
