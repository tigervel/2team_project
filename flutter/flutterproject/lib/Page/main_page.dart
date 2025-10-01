import 'package:flutter/material.dart';
import 'package:flutterproject/Screen/Estimate/Estimate.dart';
import 'package:flutterproject/Screen/EstimateRequestView/EstimateRequestListView.dart';
import 'package:flutterproject/API/ApiConfig.dart';
import 'package:flutterproject/Screen/OrderDetailCard/OrderDetailHardcodedView.dart';
import 'package:flutterproject/Screen/Simple_inquiry/SimpleInquiry.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutterproject/DTO/noticeDTOEx.dart';
import 'package:flutterproject/screen/Notice/MainNoticeList.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutterproject/features/my_inform/my_inform_page.dart';
import 'package:flutterproject/shell/carousel_shell.dart';

// 화면 상태 Enum
enum MainPageView { home, simpleInquiry, myPage, contact, orderList ,estimate}

class MainPage extends StatefulWidget {
  const MainPage({super.key});

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  bool _isLoggedIn = true; // 로그인 상태
  MainPageView _currentView = MainPageView.home; // 화면 뷰
  int _selectedIndex = -1;
  late Future<List<Notice>> _noticesFuture;

  @override
  void initState() {
    super.initState();
    _noticesFuture = getNotices();
  }

  Future<List<Notice>> getNotices() async {
    final String baseUrl = Apiconfig.baseUrl;
    final response = await http.get(
      Uri.parse('$baseUrl/api/notices?size=3&sort=createdAt,desc'),
    );

    if (response.statusCode == 200) {
      final String responseBody = utf8.decode(response.bodyBytes);
      final Map<String, dynamic> body = json.decode(responseBody);
      final List<dynamic> noticeList = body['content'];

      return noticeList.map((json) => Notice.fromJson(json)).toList();
    } else {
      throw Exception('공지사항 불러오기 실패');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(context),
      body: _buildBody(),

      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _currentView == MainPageView.home
            ? 0
            : _getCurrentIndex(),
        backgroundColor: Colors.indigo,
        showSelectedLabels: true,
        showUnselectedLabels: true,
        selectedItemColor: _currentView == MainPageView.home
            ? Colors.white
            : Colors.white70,
        unselectedItemColor: Colors.white,
        onTap: (index) {
          setState(() {
            switch (index) {
              case 0:
                _currentView = MainPageView.orderList; // 주문현황
                break;
              case 1:
                _currentView = MainPageView.estimate; // 견적조회
                break;
              case 2:
                _currentView = MainPageView.contact; // 문의사항
                break;
              case 3:
                _currentView = MainPageView.myPage;
                if (_isLoggedIn) {
                } else {
                  Navigator.pushNamed(context, '/login'); // 로그인 x → 로그인페이지
                }
                break;
              
            }
          });
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.list_alt), label: "주문현황"),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: "견적서 작성"),
          BottomNavigationBarItem(icon: Icon(Icons.chat), label: "문의사항"),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "마이페이지"),
        ],
      ),
    );
  }

  int _getCurrentIndex() {
    switch (_currentView) {
      case MainPageView.orderList:
        return 0;
      case MainPageView.simpleInquiry:
        return 1;
      case MainPageView.contact:
        return 2;
      case MainPageView.myPage:
        return 3;
      case MainPageView.estimate:
        return 1;
      case MainPageView.home:
        return 999;
    }
  }

  AppBar _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.indigo,
      leading: _currentView != MainPageView.home
          ? IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () {
                setState(() {
                  _currentView = MainPageView.home; // 홈으로 돌아가기
                });
              },
            )
          : null,
      title: InkWell(
        onTap: () {
          setState(() {
            _currentView = MainPageView.home; // 제목 누르면 홈으로 이동
          });
        },
        child: Image.asset(
          'assets/images/g2i4_logo.png',
          height: 60,
          fit: BoxFit.contain,
        ),
      ),
      centerTitle: true,
    );
  }

  Widget _buildBody() {
    switch (_currentView) {
      case MainPageView.home:
        return HomeView(noticesFuture: _noticesFuture,);
      case MainPageView.estimate:
        return Estimate(onSubmitted: () {
          setState(() {
            _currentView = MainPageView.home;
          });
        },); // 견적조회
      case MainPageView.simpleInquiry:
        return Simpleinquiry(); //간편조회
      case MainPageView.myPage:
        return const DashboardCarouselShell(
          showAppBar: false,
          showBottomBar: false,
          showIndicator: true, // ✅ 동그라미 표시
        );
      case MainPageView.contact:
        return EstimateRequestListView(); // 문의하기
      case MainPageView.orderList:
        return OrderDetailHardcodedView(); // 주문현황
    }
  }
}

class HomeView extends StatelessWidget {
  final Future<List<Notice>> noticesFuture;

  const HomeView({super.key, required this.noticesFuture});

  @override
  Widget build(BuildContext context) {
    final List<String> imgList = [
      'assets/images/banner1.png',
      'assets/images/banner2.png',
    ];
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CarouselSlider(
            options: CarouselOptions(
              height: 200.0,
              autoPlay: true,
              enlargeCenterPage: true,
              viewportFraction: 1.0,
            ),
            items: imgList.map((item) {
              return Builder(
                builder: (BuildContext context) {
                  return ClipRRect(
                    borderRadius: BorderRadius.circular(0),
                    child: Image.asset(
                      item,
                      fit: BoxFit.cover,
                      width: MediaQuery.of(context).size.width,
                    ),
                  );
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 10),
          QuickActionButton(
            label: ">> >  빠른 간편 조회  < < <",
            onTap: () {
              final mainPageState = context
                  .findAncestorStateOfType<_MainPageState>();
              if (mainPageState != null) {
                mainPageState.setState(() {
                  mainPageState._currentView = MainPageView.simpleInquiry;
                });
              }
            },
          ),
          const SizedBox(height: 10),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0),
            child: MainNoticeList(),
          ),
          const Footer(),
        ],
      ),
    );
  }
}

class Footer extends StatelessWidget {
  const Footer({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      //color: Colors.grey[200],
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const Text("G2I4로직스", style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text("서울시 강남구 테헤란로 123"),
          const Text("고객센터: 02-1234-5678 | g2i4@example.com"),

          Row(mainAxisAlignment: MainAxisAlignment.center),

          const SizedBox(height: 12),
        ],
      ),
    );
  }
}

class QuickActionButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const QuickActionButton({
    super.key,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        margin: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.indigo,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}
