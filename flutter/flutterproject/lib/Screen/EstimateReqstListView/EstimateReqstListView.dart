// lib/Screen/OrderList/EstimateRequestListView.dart
import 'package:flutter/material.dart';
import 'package:flutterproject/API/MatchingAPI.dart';
import 'package:flutterproject/DTO/MatchingDTO.dart';
import 'package:flutterproject/DTO/PageRequestDTO.dart';
import 'package:flutterproject/DTO/PageResponseDTO.dart';

const String bearerToken =
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ6enoxMjM0NSIsImxvZ2luSWQiOiJ6enoxMjM0NSIsImVtYWlsIjoicGtuNDY5M0BuYXZlci5jb20iLCJyb2xlcyI6WyJST0xFX0RSSVZFUiIsIlJPTEVfVVNFUiJdLCJpc3MiOiJnaXByb2plY3QiLCJpYXQiOjE3NTg3MDMzMTEsImV4cCI6MTc1ODcwNTExMX0.5kKE8idCd3CXeipHJYqhIpxpzHiaesV4ESemkNW_hRs';

class EstimateRequestListView extends StatefulWidget {
  // ✅ 상위에서 전달
  const EstimateRequestListView({super.key});

  @override
  State<EstimateRequestListView> createState() =>
      _EstimateRequestListViewState();
}

class _EstimateRequestListViewState extends State<EstimateRequestListView> {
  final _api = MatchingApi();
  int _currentPage = 1;
  static const int _pageSize = 5;

  PageResponseDTO<MatchingDTO>? _page;
  bool _loading = true;
  int _expandedId = -1;
  final Map<int, String> _decision = {}; // id -> 'accept' | 'reject'

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final page = await _api.getEstimateList(
        request: PageRequestDTO(page: _currentPage, size: _pageSize),
        bearerToken: bearerToken,
      );
      if (!mounted) return;
      setState(() {
        _page = page;
        _loading = false;
        _expandedId = -1;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('목록 불러오기 실패: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final blue = const Color(0xFFBFD7FF);

    return SafeArea(
      top: false,
      bottom: true,
      left: false,
      right: false,
      child: Container(
        width: double.infinity,
        height: double.infinity,
        color: blue,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                children: [
                  const SizedBox(height: 12),
                  const Icon(
                    Icons.local_shipping,
                    size: 64,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 12),

                  // 헤더
                  Row(
                    children: const [
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          '출발 - 도착',
                          style: TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ),
                      Text('금액', style: TextStyle(fontWeight: FontWeight.w700)),
                      SizedBox(width: 12),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // 리스트
                  Expanded(
                    child: ListView.builder(
                      padding: EdgeInsets.zero,
                      itemCount: _page?.dtoList.length ?? 0,
                      itemBuilder: (_, i) => _buildItem(_page!.dtoList[i]),
                    ),
                  ),

                  const SizedBox(height: 8),
                  _buildPagination(),
                  const SizedBox(height: 8),
                ],
              ),
      ),
    );
  }

  Widget _buildItem(MatchingDTO item) {
    final isExpanded = _expandedId == item.matchNo;
    final decided = _decision[item.matchNo];

    // 금액 문자열 정리 (필요하면 콤마 추가)
    String money(String s) {
      final digits = s.replaceAll(RegExp(r'[^\d]'), '');
      if (digits.isEmpty) return s;
      final buf = StringBuffer();
      for (int i = 0; i < digits.length; i++) {
        if (i > 0 && (digits.length - i) % 3 == 0) buf.write(',');
        buf.write(digits[i]);
      }
      return buf.toString();
    }

    return Column(
      children: [
        InkWell(
          onTap: () =>
              setState(() => _expandedId = isExpanded ? -1 : item.matchNo),
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 6),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: Colors.black54),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  margin: const EdgeInsets.only(right: 10),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                ),
                // ✅ route 그대로 표시: "출발지 - 도착지"
                Expanded(
                  child: Text(item.route, overflow: TextOverflow.ellipsis),
                ),
                // ✅ totalCost 문자열 사용
                Text(
                  "${money(item.totalCost)}원",
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                const SizedBox(width: 6),
                Icon(isExpanded ? Icons.expand_less : Icons.expand_more),
              ],
            ),
          ),
        ),

        if (isExpanded) ...[
          Container(
            width: double.infinity,
            margin: const EdgeInsets.only(bottom: 6),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF7FBFF),
              border: Border.all(color: Colors.black26),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _kv('거리(KM)', item.distanceKm),
                _kv('무게', item.cargoWeight),
                _kv('화물 종류', item.cargoType),
                _kv('출발 시간', item.startTime),
                _kv('수락 여부', item.isAccepted ? '예' : '아니오'),
                if (item.acceptedTime != null && item.acceptedTime!.isNotEmpty)
                  _kv('수락 시각', item.acceptedTime!),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _pillButton(
                      label: '수락',
                      color: Colors.green,
                      selected: decided == 'accept',
                      onTap: () async {
                        final estimateNo = item.eno;
                   
                        if (estimateNo == null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('eno값이 없이는 처리불가')),
                          );
                          return;
                        }
                        try {
                          await _api.acceptMatching(
                            estimateNo: estimateNo,
                            bearerToken: bearerToken,
                          );
                          if (!mounted) return;
                          setState(
                            () => _decision[item.matchNo] = 'accept',
                          ); // UI 반영(선택)
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('수락되었습니다.')),
                          );
                          await _load();
                        } catch (e) {
                          if (!mounted) return;
                          ScaffoldMessenger.of(
                            context,
                          ).showSnackBar(SnackBar(content: Text('수락 실패')));
                        }
                      },
                    ),
                    const SizedBox(width: 8),
                    _pillButton(
                      label: '거절',
                      color: Colors.red,
                      selected: decided == 'reject',
                      onTap: () {
                        setState(() => _decision[item.matchNo] = 'reject');
                        // TODO: 거절 API 호출
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  // 작은 UI helpers
  Widget _kv(String k, String v) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('$k : ', style: const TextStyle(fontWeight: FontWeight.w700)),
        Expanded(child: Text(v)),
      ],
    ),
  );

  Widget _pillButton({
    required String label,
    required Color color,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? color : Colors.white,
          border: Border.all(color: color, width: 2),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : color,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }

  Widget _buildPagination() {
    if (_page == null) return const SizedBox.shrink();
    final totalPages = _page!.totalPage == 0
        ? ((_page!.totalCount + _pageSize - 1) ~/ _pageSize)
        : _page!.totalPage;

    Widget pageBtn(int n) {
      final selected = _currentPage == n;
      return SizedBox(
        width: 36,
        height: 36,
        child: OutlinedButton(
          style: OutlinedButton.styleFrom(
            backgroundColor: selected ? Colors.black : Colors.white,
            foregroundColor: selected ? Colors.white : Colors.black,
            side: const BorderSide(color: Colors.black),
            padding: EdgeInsets.zero,
          ),
          onPressed: () {
            setState(() => _currentPage = n);
            _load();
          },
          child: Text('$n'),
        ),
      );
    }

    final pages = _page!.pageNumList.isNotEmpty
        ? _page!.pageNumList
        : List<int>.generate(totalPages, (i) => i + 1).take(5).toList();

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        for (int i = 0; i < pages.length; i++) ...[
          if (i > 0) const SizedBox(width: 6),
          pageBtn(pages[i]),
        ],
        const SizedBox(width: 6),
        SizedBox(
          height: 36,
          child: OutlinedButton(
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.black),
              backgroundColor: Colors.white,
            ),
            onPressed: _page!.next
                ? () {
                    setState(
                      () => _currentPage = (_page!.nextPage == 0
                          ? _currentPage + 1
                          : _page!.nextPage),
                    );
                    _load();
                  }
                : null,
            child: const Text('NEXT', style: TextStyle(color: Colors.black)),
          ),
        ),
      ],
    );
  }

  // utils
  String _money(int n) {
    final s = n.toString();
    final buf = StringBuffer();
    for (int i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(',');
      buf.write(s[i]);
    }
    return buf.toString();
  }

  String _fmtDate(DateTime dt) {
    final ampm = dt.hour < 12 ? 'AM' : 'PM';
    final h12 = dt.hour == 0 ? 12 : (dt.hour > 12 ? dt.hour - 12 : dt.hour);
    final mm = dt.minute.toString().padLeft(2, '0');
    return '${dt.year}년 ${dt.month}월 ${dt.day}일 $ampm $h12:$mm';
  }
}
