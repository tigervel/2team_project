import 'package:flutter/material.dart';

class DriverHome extends StatelessWidget {
  const DriverHome({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text("운송사 홈")),
    body: const Center(child: Text("운송사 메인 화면")),
  );
}
