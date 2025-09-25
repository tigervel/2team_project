import 'package:flutter/material.dart';

import 'package:flutterproject/Page/MainPageEx.dart';
import 'package:flutterproject/Screen/Simple_inquiry/SimpleInquiry.dart';
import 'package:flutterproject/component_jh/login.dart';
import 'package:flutterproject/component_jh/signup.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Project',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.blue),
      // 앱 시작 화면을 MainPageEx로 설정
      home: Mainpageex(),
      routes: {
        '/main': (context) => Mainpageex(),
        '/estimate': (context) => Simpleinquiry(),
        '/login': (context) => const LoginPage(),
        '/signup': (context) => const SignUpPage(),
        // '/social-signup': (context) =>
        //     const SocialSignupPage(signupTicket: "VALID_TICKET"),
      },
    );
  }
}
