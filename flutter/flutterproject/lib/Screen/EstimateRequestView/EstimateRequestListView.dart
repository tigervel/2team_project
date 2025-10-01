// lib/Screen/OrderList/EstimateRequestListView.dart
import 'package:flutter/material.dart';
import 'package:flutterproject/API/MatchingAPI.dart';
import 'package:flutterproject/DTO/MatchingDTO.dart';
import 'package:flutterproject/DTO/PageRequestDTO.dart';
import 'package:flutterproject/DTO/PageResponseDTO.dart';
import 'package:flutterproject/Utils/util.dart';
import 'package:flutterproject/provider/TokenProvider.dart';

import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

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
  //final token = Storage.getToken();
  PageResponseDTO<MatchingDTO>? _page;
  bool _loading = true;
  int _expandedId = -1;
  final Map<int, String> _decision = {}; // id -> 'accept' | 'reject'
  String? _readBearer() {
    final t = context.read<Tokenprovider>().gettoken; // ✅ 타입/이름 수정
    if (t == null || t.isEmpty) return null;
    return t;
  }

  void _goHomeWithMsg(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    Navigator.of(context).pushReplacementNamed('/'); // 홈 라우트로 이동
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _load(); // ✅ 첫 프레임 이후 실행
    });
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final bearerToken = _readBearer();
      print(bearerToken);

      if (bearerToken == null) {
        _goHomeWithMsg('로그인이 필요합니다.');
        return;
      }
      final roles = getRolesFromToken(bearerToken);
      print(roles);
      if (!roles.contains('ROLE_DRIVER')) {
        _goHomeWithMsg('차주 회원만 이용 가능합니다.');
        return;
      }
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
                      Text(
                        '상세보기',
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),
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
                _kv('출발 시간', _formatKoreanDateTime(item.startTime)),
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
                        final bearer = _readBearer(); // ✅
                        if (bearer == null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('로그인이 필요합니다.')),
                          );
                          return;
                        }
                        try {
                          await _api.acceptMatching(
                            estimateNo: estimateNo,
                            bearerToken: bearer,
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
                      onTap: () async {
                        final estimateNo = item.eno;

                        if (estimateNo == null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('eno값이 없이는 처리불가')),
                          );
                          return;
                        }
                        final bearer = _readBearer(); // ✅
                        if (bearer == null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('로그인이 필요합니다.')),
                          );
                          return;
                        }
                        try {
                          await _api.rejectMatching(
                            estimateNo: estimateNo,
                            bearerToken: bearer,
                          );
                          if (!mounted) return;
                          setState(
                            () => _decision[item.matchNo] = 'reject',
                          ); // UI 반영(선택)
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('거절되었습니다.')),
                          );
                          await _load();
                        } catch (e) {
                          if (!mounted) return;
                          ScaffoldMessenger.of(
                            context,
                          ).showSnackBar(SnackBar(content: Text('거절 실패')));
                        }
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
  final p = _page;
  if (p == null) return const SizedBox.shrink();

  // 1) 전체 페이지 수 계산 (totalPage 있으면 그걸 신뢰, 없으면 totalCount로 계산)
  final totalPages = (p.totalPage > 0)
      ? p.totalPage
      : ((p.totalCount + _pageSize - 1) ~/ _pageSize);

  // 2) 한 페이지 뿐이면 페이지네이션 자체를 숨김
  if (totalPages <= 1) return const SizedBox.shrink();

  // 3) 좌/우 이동 가능 여부를 현재 페이지로 직접 판단
  final hasPrev = _currentPage > 1;
  final hasNext = _currentPage < totalPages;

  // 4) 표시할 페이지 목록 (서버가 주면 사용, 없으면 1..totalPages)
  final pages = p.pageNumList.isNotEmpty
      ? p.pageNumList
      : List<int>.generate(totalPages, (i) => i + 1);

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
          if (_currentPage == n) return;
          setState(() => _currentPage = n);
          _load();
        },
        child: Text('$n'),
      ),
    );
  }

  return Row(
    mainAxisAlignment: MainAxisAlignment.center,
    children: [
      // 이전
      IconButton(
        icon: const Icon(Icons.chevron_left),
        onPressed: hasPrev
            ? () {
                setState(() => _currentPage--);
                _load();
              }
            : null,
      ),

      // 페이지 버튼들 (너무 많으면 앞 5개 정도만 노출 — 원하면 윈도우링 로직으로 바꿔도 됨)
      for (int i = 0; i < pages.take(5).length; i++) ...[
        if (i > 0) const SizedBox(width: 6),
        pageBtn(pages[i]),
      ],

      // 다음
      IconButton(
        icon: const Icon(Icons.chevron_right),
        onPressed: hasNext
            ? () {
                setState(() => _currentPage++);
                _load();
              }
            : null,
      ),
    ],
  );


  }

  DateTime? _parseServerDateTime(String raw) {
    try {
      // ISO 형태면 먼저 시도: '2025-09-24T10:30:00' 또는 '2025-09-24 10:30:00'
      final normalized = raw.contains('T') ? raw : raw.replaceFirst(' ', 'T');
      final dt = DateTime.tryParse(normalized);
      if (dt != null) return dt.toLocal();
    } catch (_) {}

    // 커스텀 포맷들 시도 (서버 포맷에 맞춰 추가/수정)
    const patterns = [
      "yyyy-MM-dd HH:mm:ss",
      "yyyy-MM-dd'T'HH:mm:ss",
      "yyyy-MM-dd HH:mm",
      "yyyy-MM-dd'T'HH:mm",
      "yyyy-MM-dd", // 날짜만 오는 경우
    ];
    for (final p in patterns) {
      try {
        final dt = DateFormat(p).parseStrict(raw);
        return dt.toLocal();
      } catch (_) {}
    }
    return null; // 실패 시
  }

  String _formatKoreanDateTime(String raw) {
    final dt = _parseServerDateTime(raw);
    if (dt == null) return raw; // 파싱 실패 시 원문 출력
    // dayjs: 'YYYY년 MM월 DD일 A hh:mm' → intl: 'yyyy년 MM월 dd일 a hh:mm'
    return DateFormat('yyyy년 MM월 dd일 a hh:mm', 'ko_KR').format(dt);
  }
}
