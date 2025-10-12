import 'package:flutter/material.dart';

import 'package:flutterproject/Page/main_page.dart';
import 'package:flutterproject/Screen/Simple_inquiry/SimpleInquiry.dart';
import 'package:flutterproject/component_jh/login.dart';
import 'package:flutterproject/component_jh/signup.dart';
import 'package:flutterproject/features/my_inform/my_inform_page.dart';
import 'package:flutterproject/provider/TokenProvider.dart';
import 'package:flutterproject/provider/NoticeProvider.dart';
import 'package:flutterproject/Screen/Notice/NoticeDetailScreen.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';

void main() async{
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('ko_Kr',null);
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => Tokenprovider()..loadToken()),
        ChangeNotifierProvider(create: (_) => NoticeProvider()),
      ],
      child: MaterialApp(
        title: 'Flutter Project',

        debugShowCheckedModeBanner: false,
        home: MainPage(),
        routes: {
          '/estimate': (context) => Simpleinquiry(),
          '/login': (_) => LoginPage(),
          '/signup': (_) => SignUpPage(),
          '/mypage': (_) => const MyInformPage(),
        },
        onGenerateRoute: (settings) {
          // 동적 라우팅 (파라미터 전달)
          if (settings.name == '/notice/detail') {
            final noticeId = settings.arguments as int;
            return MaterialPageRoute(
              builder: (context) => NoticeDetailScreen(noticeId: noticeId),
            );
          }
          return null;
        },
      ),
    ),
  );
}
