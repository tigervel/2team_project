import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

import '../Utils/util.dart';
import '../core/auth_token.dart';
import '../features/driver_delivery/driver_delivery_page.dart';
import '../features/edit_my_inform/edit_my_inform_page.dart';
import '../features/my_inform/my_inform_page.dart';
import '../features/vehicle/edit_vehicle_inform_page.dart';

class DashboardCarouselShell extends StatefulWidget {
  const DashboardCarouselShell({
    super.key,
    this.showAppBar = false, // 기본: 끔
    this.showBottomBar = false, // 기본: 끔
    this.showIndicator = true,
    this.initialPage = 0,
  });

  final bool showAppBar;
  final bool showBottomBar;
  final int initialPage;
  final bool showIndicator;

  @override
  State<DashboardCarouselShell> createState() => _DashboardCarouselShellState();
}

class _PageTab {
  final String title;
  final IconData icon;
  final Widget page;
  final bool driverOnly;

  const _PageTab({
    required this.title,
    required this.icon,
    required this.page,
    this.driverOnly = false,
  });
}

class _DashboardCarouselShellState extends State<DashboardCarouselShell> {
  late final PageController _pageCtrl;
  int _index = 0;
  late final int _requestedInitialIndex;

  static const List<_PageTab> _allTabs = [
    _PageTab(
      title: '배송 정보 관리',
      icon: Icons.analytics_outlined,
      page: MyInformPage(),
    ),
    _PageTab(
      title: '회원 정보 수정',
      icon: Icons.person_outline,
      page: EditMyInformPage(),
    ),
    _PageTab(
      title: '운전사 배송 관리',
      icon: Icons.local_shipping_outlined,
      page: DriverDeliveryPage(),
    ),
    _PageTab(
      title: '차량 정보 관리',
      icon: Icons.directions_car_filled_outlined,
      page: EditVehicleInformPage(),
      driverOnly: true,
    ),
  ];

  List<_PageTab> _tabs = const [];
  bool _loadingTabs = true;

  @override
  void initState() {
    super.initState();
    _pageCtrl = PageController(viewportFraction: 0.98);
    _requestedInitialIndex = widget.initialPage;
    _initialiseTabs();
  }

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
  }

  Future<void> _initialiseTabs() async {
    final isDriver = await _hasDriverRole();
    final visible = _allTabs
        .where((tab) => !tab.driverOnly || isDriver)
        .toList(growable: false);
    if (!mounted) return;
    final initialCandidate = visible.isEmpty ? 0 : _requestedInitialIndex.clamp(0, visible.length - 1);
    setState(() {
      _tabs = visible;
      _index = initialCandidate;
      _loadingTabs = false;
    });
    if (_pageCtrl.hasClients) {
      _pageCtrl.jumpToPage(initialCandidate);
    } else {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        if (_pageCtrl.hasClients) {
          _pageCtrl.jumpToPage(initialCandidate);
        }
      });
    }
  }

  Future<bool> _hasDriverRole() async {
    final token = await loadAccessToken();
    if (token.isEmpty) return false;
    final roles = getRolesFromToken(token);
    return roles.any((role) =>
        role.toUpperCase() == 'ROLE_DRIVER' ||
        role.toUpperCase() == 'ROLE_CARGO_OWNER' ||
        role.toUpperCase() == 'ROLE_OWNER');
  }

  void _go(int i) {
    _pageCtrl.animateToPage(
      i,
      duration: const Duration(milliseconds: 320),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loadingTabs) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_tabs.isEmpty) {
      return const Scaffold(
        body: Center(child: Text('표시할 정보가 없습니다. 로그인 상태를 확인해주세요.')),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),

      // ★ 필요할 때만 AppBar 보이기
      appBar: widget.showAppBar
          ? AppBar(
              title: Text(_tabs[_index].title),
              actions: [
                for (int i = 0; i < _tabs.length; i++)
                  IconButton(
                    tooltip: _tabs[i].title,
                    onPressed: () => _go(i),
                    icon: Icon(_tabs[i].icon),
                  ),
                const SizedBox(width: 4),
              ],
            )
          : null,

      body: Column(
        children: [
          if (widget.showIndicator) const SizedBox(height: 8),
          if (widget.showIndicator)
            Center(
              child: SmoothPageIndicator(
                controller: _pageCtrl,
                count: _tabs.length,
                effect: const ExpandingDotsEffect(
                  dotHeight: 8,
                  dotWidth: 8,
                  spacing: 8,
                ),
                onDotClicked: _go,
              ),
            ),
          if (widget.showIndicator) const SizedBox(height: 8),

          Expanded(
            child: PageView.builder(
              controller: _pageCtrl,
              physics: const PageScrollPhysics(),
              onPageChanged: (i) => setState(() => _index = i),
              itemCount: _tabs.length,
              itemBuilder: (context, i) {
                return AnimatedBuilder(
                  animation: _pageCtrl,
                  builder: (context, child) {
                    double t = 1.0;
                    if (_pageCtrl.position.haveDimensions) {
                      t = (_pageCtrl.page! - i).abs().clamp(0.0, 1.0);
                    }
                    final scale = 1 - (t * 0.02);
                    final opacity = 1 - (t * 0.2);
                    return Transform.scale(
                      scale: scale,
                      child: Opacity(
                        opacity: opacity,
                        child: _KeepAlive(child: _tabs[i].page),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),

      // ★ 필요할 때만 하단바 보이기
      bottomNavigationBar: widget.showBottomBar
          ? NavigationBar(
              selectedIndex: _index,
              onDestinationSelected: _go,
              destinations: _tabs
                  .map(
                    (tab) => NavigationDestination(
                      icon: Icon(tab.icon),
                      label: tab.title,
                    ),
                  )
                  .toList(growable: false),
            )
          : null,
    );
  }
}

class _KeepAlive extends StatefulWidget {
  final Widget child;
  const _KeepAlive({required this.child});
  @override
  State<_KeepAlive> createState() => _KeepAliveState();
}

class _KeepAliveState extends State<_KeepAlive>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
  @override
  Widget build(BuildContext context) {
    super.build(context);
    return widget.child;
  }
}
