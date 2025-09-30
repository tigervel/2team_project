import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

import '../features/my_inform/my_inform_page.dart';
import '../features/edit_my_inform/edit_my_inform_page.dart';
import '../features/driver_delivery/driver_delivery_page.dart';

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

class _DashboardCarouselShellState extends State<DashboardCarouselShell> {
  late final PageController _pageCtrl;
  int _index = 0;

  final _titles = const ['배송 정보 관리', '회원 정보 수정', '운전사 배송 관리'];
  final _pages = const [
    MyInformPage(),
    EditMyInformPage(),
    DriverDeliveryPage(),
  ];

  @override
  void initState() {
    super.initState();
    _pageCtrl = PageController(
      viewportFraction: 0.98,
      initialPage: widget.initialPage,
    );
    _index = widget.initialPage;
  }

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
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
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),

      // ★ 필요할 때만 AppBar 보이기
      appBar: widget.showAppBar
          ? AppBar(
              title: Text(_titles[_index]),
              actions: [
                IconButton(
                  tooltip: 'MyInform',
                  onPressed: () => _go(0),
                  icon: const Icon(Icons.analytics_outlined),
                ),
                IconButton(
                  tooltip: '내 정보 수정',
                  onPressed: () => _go(1),
                  icon: const Icon(Icons.person_outline),
                ),
                IconButton(
                  tooltip: '운전사 배송',
                  onPressed: () => _go(2),
                  icon: const Icon(Icons.local_shipping_outlined),
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
                count: _pages.length,
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
              itemCount: _pages.length,
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
                        child: _KeepAlive(child: _pages[i]),
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
              destinations: const [
                NavigationDestination(
                  icon: Icon(Icons.analytics_outlined),
                  label: '요약',
                ),
                NavigationDestination(
                  icon: Icon(Icons.person_outline),
                  label: '내 정보',
                ),
                NavigationDestination(
                  icon: Icon(Icons.local_shipping_outlined),
                  label: '배송',
                ),
              ],
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
