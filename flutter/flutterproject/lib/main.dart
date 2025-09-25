import 'package:flutter/material.dart';

import 'package:flutterproject/Page/main_page.dart';
import 'package:flutterproject/Screen/Simple_inquiry/SimpleInquiry.dart';
import 'package:flutterproject/component_jh/login.dart';
import 'package:flutterproject/component_jh/signup.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  runApp(
    MaterialApp(
      title: 'Flutter Project',

      debugShowCheckedModeBanner: false,
      home: MainPage(),
      routes: {
        '/estimate': (context) => Simpleinquiry(),
        '/login': (_) => const LoginPage(),
        '/signup': (_) => const SignUpPage(),
      },
    ),
  );
}
