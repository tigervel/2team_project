import 'package:flutter/material.dart';

// ✅ 카카오 SDK
import 'package:kakao_flutter_sdk_user/kakao_flutter_sdk_user.dart';

// 기존 import 유지
import 'package:flutterproject/Page/main_page.dart';
import 'package:flutterproject/Screen/Simple_inquiry/SimpleInquiry.dart';
import 'package:flutterproject/component_jh/login.dart';
import 'package:flutterproject/component_jh/signup.dart';
import 'package:flutterproject/features/my_inform/my_inform_page.dart';
import 'package:flutterproject/provider/TokenProvider.dart';
import 'package:flutterproject/provider/NoticeProvider.dart';
import 'package:flutterproject/Screen/Notice/NoticeDetailScreen.dart';
import 'package:flutterproject/provider/UserProvider.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Intl 로케일 (오타 주의: 'ko_KR')
  await initializeDateFormatting('ko_KR', null);

  // 카카오 SDK 초기화 (네이티브 앱 키로 교체)
  KakaoSdk.init(nativeAppKey: '8e94f7750d74c52bb062c8601046a6dd');

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => Tokenprovider()..loadToken()),
        ChangeNotifierProvider(create: (_) => NoticeProvider()),
        ChangeNotifierProvider(create: (_) => UserProvider()),
      ],
      child: const _App(),
    ),
  );
}

class _App extends StatelessWidget {
  const _App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
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
    );
  }
}
