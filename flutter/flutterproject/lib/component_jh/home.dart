import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  final String id;
  final String role; // 화주 or 차주

  const HomePage({super.key, required this.id, required this.role});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('홈 화면 ($role)'),
      ),
      body: Center(
        child: Text(
          '환영합니다, $id 님!\n($role 계정으로 로그인됨)',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 20),
        ),
      ),
    );
  }
}
