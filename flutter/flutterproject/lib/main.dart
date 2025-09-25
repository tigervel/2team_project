import 'package:flutter/material.dart';

import 'package:flutterproject/Page/MainPageEx.dart';
import 'package:flutterproject/Screen/Simple_inquiry/SimpleInquiry.dart';
import 'package:flutterproject/component_jh/login.dart';
import 'package:flutterproject/component_jh/signup.dart';
import 'package:intl/date_symbol_data_local.dart';



void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting("ko_KR"); 
 
  runApp(MaterialApp(
          title: 'Flutter Project',
    
    debugShowCheckedModeBanner: false,
    home: Mainpageex(),
    routes: {
      '/estimate':(context) => Simpleinquiry(),
      '/login': (_) => const LoginPage(),
      '/signup': (_) => const SignUpPage(),
    },));


}