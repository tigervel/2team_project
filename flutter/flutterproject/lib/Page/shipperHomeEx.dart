import 'package:flutter/material.dart';

class ShipperHome extends StatelessWidget {
  const ShipperHome({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text("화주 홈")),
    body: const Center(child: Text("화주 메인 화면")),
  );
}
