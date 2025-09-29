import 'package:flutter/material.dart';
import 'package:flutterproject/Screen/EstimateReqstListView/EstimateReqstListView.dart';
import 'package:flutterproject/Screen/OrderDetailCard/OrderDetailHardcodedView.dart';
import 'package:flutterproject/Screen/Simple_inquiry/SimpleInquiry.dart';

// 화면의 상태를 관리하기 위한 Enum
enum MainPageView { home, simpleInquiry, myPage, contact, orderList }

class Mainpageex extends StatefulWidget {
  const Mainpageex({super.key});

  @override
  State<Mainpageex> createState() => _MainpageexState();
}

class _MainpageexState extends State<Mainpageex> {
  // 현재 로그인 상태와 화면 뷰를 관리하는 상태 변수
  bool _isLoggedIn = false;
  MainPageView _currentView = MainPageView.home;

  // AppBar를 빌드하는 함수
  AppBar _buildAppBar() {
    return AppBar(
      // 홈 화면이 아닐 경우에만 뒤로가기 버튼 표시
      leading: _currentView != MainPageView.home
          ? IconButton(
              icon: Icon(Icons.arrow_back),
              onPressed: () {
                setState(() {
                  _currentView = MainPageView.home; // 홈으로 돌아가기
                });
              },
            )
          : null,
      title: Text('메인페이지'),
      actions: [
        // 로그인 상태에 따라 다른 버튼을 보여줌
        _isLoggedIn
            ? TextButton(
                onPressed: () {
                  setState(() {
                    _isLoggedIn = false; // 로그아웃 처리
                  });
                },
                child: Text('로그아웃'),
              )
            : TextButton(
                onPressed: () async {
                  final result = await Navigator.pushNamed(context, '/login');
                  if (result == true && mounted) {
                    setState(() {
                      _isLoggedIn = true;
                    });
                  }
                },
                child: Text('로그인/회원가입'),
              ),
      ],
    );
  }

  // Body를 빌드하는 함수
  Widget _buildBody() {
    // 현재 뷰 상태에 따라 다른 위젯을 반환
    switch (_currentView) {
      case MainPageView.home:
        return _buildHomeBody();
      case MainPageView.simpleInquiry:
        return Simpleinquiry();
      case MainPageView.myPage:
        // Navigator.push로 GIProjectApp 실행
        Future.microtask(() {
          Navigator.pushNamed(context, '/mypage');
        });
        return const SizedBox();
      case MainPageView.contact:
        return const EstimateRequestListView(); // 임시
      case MainPageView.orderList:
        return const OrderDetailHardcodedView(); // 임시
    }
  }

  // 4개의 버튼이 있는 홈 화면 Body
  Widget _buildHomeBody() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ElevatedButton(
            onPressed: () {
              setState(() {
                _currentView = MainPageView.simpleInquiry;
              });
            },
            child: Text('간편견적조회'),
          ),
          SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _currentView = MainPageView.myPage;
              });
            },
            child: Text('마이페이지'),
          ),
          SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _currentView = MainPageView.contact;
              });
            },
            child: Text('문의하기'),
          ),
          SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _currentView = MainPageView.orderList;
              });
            },
            child: Text('주문리스트'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: _buildAppBar(), body: _buildBody());
  }
}
