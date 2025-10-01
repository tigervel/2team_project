import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutterproject/API/FeesApi.dart';
import 'package:flutterproject/API/MapApi.dart';
import 'package:flutterproject/API/EstimateApi.dart'; // ✅ 제출 API
import 'package:flutterproject/Model/FeesExtraModel.dart';
import 'package:flutterproject/Model/FeesModel.dart';
import 'package:flutterproject/Utils/util.dart';
import 'package:flutterproject/provider/TokenProvider.dart';
import 'package:kpostal/kpostal.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';

class Estimate extends StatefulWidget {
  final VoidCallback? onSubmitted;
  const Estimate({super.key, this.onSubmitted});

  @override
  State<Estimate> createState() => _EstimateState();
}

class _EstimateState extends State<Estimate> {
  // ----- APIs
  final FeesApi _feesApi = FeesApi();
  final MapApi _mapApi = MapApi(); // ✅ 지도/거리
  final EstimateApi _estimateApi = EstimateApi(); // ✅ 제출

  // ----- Data
  List<FeesModel> _fees = [];
  List<FeesExtraModel> _extras = [];
  final _startCtl = TextEditingController();
  final _endCtl = TextEditingController();
  final _cargoTypeCtl = TextEditingController();
  FeesModel? _selectedFee;
  double _distanceKm = 0.0;

  // 추가요금 선택 (인덱스 보관)
  final Set<int> _selectedExtraIdx = {};

  // ----- Time
  DateTime? _startTime; // 예약시간
  static const int _startHour = 9;
  static const int _endHour = 16;
  late final DateTime _minDateOnly;

  // ----- 금액 집계
  int get _baseCost => (_selectedFee?.baseCost.toInt() ?? 0);
  int get _distanceCost =>
      ((_selectedFee?.ratePerKm ?? 0) * _distanceKm).round();
  int get _specialCost => _selectedExtraIdx
      .map((i) => _extras[i].extraCharge) // ✅ 필드명 맞춤
      .fold(0, (a, b) => a + b);
  int get _totalCost => _baseCost + _distanceCost + _specialCost;

  // ----- Map
  late final WebViewController _webCtrl;
  bool _showMap = false;

  bool _loadingFees = true;
  bool _loadingExtras = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = context.read<Tokenprovider>().gettoken;
      if (token == null || token.isEmpty) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('로그인이 필요합니다.')));
        Navigator.of(context).pushReplacementNamed('/login');
        return;
      }
      final roles = getRolesFromToken(token);
      if (!roles.contains('ROLE_SHIPPER')) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('일반 회원만 이용 가능 합니다.')),
        );
        Navigator.of(context).pushReplacementNamed('/');
        return;
      }
      _estimateApi.setToken(token);
    });
    // 내일 09:00 ~ 16:59
    final now = DateTime.now();
    final tmr = DateTime(
      now.year,
      now.month,
      now.day,
    ).add(const Duration(days: 1));
    _minDateOnly = tmr;
    _startTime = DateTime(tmr.year, tmr.month, tmr.day, _startHour, 0);

    // 웹뷰
    _webCtrl = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadFlutterAsset('assets/kakao_map.html'); // drawRoute(path) 필요

    // 데이터 로드
    
    _loadFees();
    print('-----------------------------------------');
    _loadExtras();

    // (선택) 인증 필요 시 토큰 주입
    // _mapApi.setBearerToken(token);
    // _estimateApi.setBearerToken(token);
    // _feesApi 내부에서 토큰 세팅 메서드가 있다면 동일하게 호출
  }

  Future<void> _loadFees() async {
    setState(() => _loadingFees = true);
    try {
      final list = await _feesApi.fetchFees();
      if (!mounted) return;
      setState(() {
        _fees = list;
        _loadingFees = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loadingFees = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('기본 요금표를 불러오지 못했습니다.')));
    }
  }

  Future<void> _loadExtras() async {
    setState(() => _loadingExtras = true);
    try {
      final list = await _feesApi.fetchFeesExtra();

      if (!mounted) return;
      setState(() {
        _extras = list;
        _loadingExtras = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loadingExtras = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('추가 요금표를 불러오지 못했습니다.')));
    }
  }

  Future<void> _pickAddress(bool isStart) async {
    final Kpostal? result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => KpostalView()),
    );
    if (result == null) return;
    setState(() {
      if (isStart) {
        _startCtl.text = result.address;
      } else {
        _endCtl.text = result.address;
      }
    });
  }

  Future<void> _calcDistanceAndDraw() async {
    final start = _startCtl.text.trim();
    final end = _endCtl.text.trim();
    if (start.isEmpty || end.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('출발지/도착지를 선택하세요.')));
      return;
    }
    try {
      // ✅ MapApi 재활용
      final dir = await _mapApi.getDirections(
        startAddress: start,
        endAddress: end,
      );

      setState(() {
        _distanceKm = dir.distanceM / 1000.0;
      });

      // HTML의 drawRoute() 호출
      final js = 'drawRoute(${jsonEncode(dir.path)});';
      await _webCtrl.runJavaScript(js);

      setState(() => _showMap = true);
    } catch (e) {
      debugPrint('경로/거리 조회 실패: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('경로 조회에 실패했습니다.')));
    }
  }

  Future<void> _pickStartDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _startTime ?? _minDateOnly,
      firstDate: _minDateOnly,
      lastDate: DateTime(2100),
    );
    if (date == null) return;

    final time = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 9, minute: 0),
      initialEntryMode: TimePickerEntryMode.input,
      helpText: '예약 시간 (09:00~16:59)',
      builder: (ctx, child) => MediaQuery(
        data: MediaQuery.of(ctx).copyWith(alwaysUse24HourFormat: false),
        child: child!,
      ),
    );
    if (time == null) return;

    final dateOnly = DateTime(date.year, date.month, date.day);
    if (dateOnly.isBefore(_minDateOnly)) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('예약 날짜는 내일부터 가능합니다.')));
      return;
    }

    // 시간대 09:00~16:59 체크
    final okTime =
        (time.hour > _startHour && time.hour < _endHour) ||
        (time.hour == _startHour) ||
        (time.hour == _endHour && time.minute <= 59);
    if (!okTime) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('예약 시간은 09:00~16:59만 가능합니다.')),
      );
      return;
    }

    setState(() {
      _startTime = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      );
    });
  }

  Future<void> _submitEstimate() async {
    if (_startCtl.text.isEmpty || _endCtl.text.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('출발지/도착지를 입력하세요.')));
      return;
    }
    if (_selectedFee == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('화물 무게를 선택하세요.')));
      return;
    }
    if (_cargoTypeCtl.text.trim().isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('화물 종류를 입력하세요.')));
      return;
    }
    if (_distanceKm <= 0) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('먼저 거리 계산을 해주세요.')));
      return;
    }
    if (_startTime == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('예약 시간을 선택하세요.')));
      return;
    }

    final selectedExtra = _selectedExtraIdx.map((i) => _extras[i]).toList();

    // 전송 payload (리액트와 유사)
    final body = {
      'startAddress': _startCtl.text.trim(),
      'endAddress': _endCtl.text.trim(),
      'cargoType': _cargoTypeCtl.text.trim(),
      'cargoWeight': _selectedFee!.weight,
      'startTime': _startTime!
          .toIso8601String()
          .split('.')
          .first, // "YYYY-MM-DDTHH:mm:ss"
      'totalCost': _totalCost,
      'distanceKm': _distanceKm.toStringAsFixed(1),
      'baseCost': _baseCost,
      'distanceCost': _distanceCost,
      'specialOption': _specialCost,
      'specialNotes': [
        for (final e in selectedExtra)
          {
            'title': e.extraChargeTitle, // ✅ 필드명 맞춤
            'amount': e.extraCharge,
          },
      ],
    };

    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('견적을 제출하시겠습니까?'),
        content: const Text('견적 내용과 틀리면 배송이 거절될 수 있습니다.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('아니요'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('확인'),
          ),
        ],
      ),
    );
    if (ok != true) return;

    try {
      // ✅ 제출 API 호출 (경로/메서드는 네가 가진 EstimateApi에 맞춰두었음)
      await _estimateApi.submitEstimate(body);

      if (!mounted) return;
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('제출 완료'),
          content: const Text('견적서 제출이 완료되었습니다.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                widget.onSubmitted?.call();
              },
              child: const Text('확인'),
            ),
          ],
        ),
      );
    } catch (e) {
      debugPrint('견적 제출 실패: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('제출에 실패했습니다.')));
    }
  }

  void _openExtraSelect() async {
    if (_loadingExtras) return;

    await showDialog<void>(
      context: context,
      builder: (_) => StatefulBuilder(
        builder: (ctx, setStateDialog) {
          return AlertDialog(
            title: const Text('특이사항 선택'),
            content: SizedBox(
              width: 360,
              child: _extras.isEmpty
                  ? const Text('추가요금 항목이 없습니다.')
                  : ListView.separated(
                      shrinkWrap: true,
                      itemCount: _extras.length,
                      itemBuilder: (_, i) {
                        final e = _extras[i];
                        final sel = _selectedExtraIdx.contains(i);
                        return CheckboxListTile(
                          value: sel,
                          onChanged: (v) {
                            // 다이얼로그 내부 리렌더
                            setStateDialog(() {
                              if (v == true) {
                                _selectedExtraIdx.add(i);
                              } else {
                                _selectedExtraIdx.remove(i);
                              }
                            });
                            // 바깥 화면(총액/선택개수 표시 등)도 즉시 반영하고 싶으면:
                            setState(() {});
                          },
                          title: Text(e.extraChargeTitle),
                          subtitle: Text('+${_money(e.extraCharge)}원'),
                          controlAffinity: ListTileControlAffinity.leading,
                        );
                      },
                      separatorBuilder: (_, __) => const Divider(height: 1),
                    ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('닫기'),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _startCtl.dispose();
    _endCtl.dispose();
    _cargoTypeCtl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final width = size.width;
    final height = size.height;

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: const Color(0xFFBFD7FF),
            border: Border.all(color: Colors.black),
          ),
          child: Column(
            children: [
              SizedBox(height: height * 0.02),
              const Text(
                '견적서 작성',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: height * 0.02),
              const Icon(Icons.local_shipping, size: 72, color: Colors.white),
              SizedBox(height: height * 0.02),

              // 주소 입력
              _buildAddressInput(
                width: width * 0.9,
                height: 48,
                label: '출발지 주소',
                controller: _startCtl,
                onPick: () => _pickAddress(true),
              ),
              const SizedBox(height: 10),
              _buildAddressInput(
                width: width * 0.9,
                height: 48,
                label: '도착지 주소',
                controller: _endCtl,
                onPick: () => _pickAddress(false),
              ),
              const SizedBox(height: 12),

              // 상단 버튼(금액/지도) & 컨텐츠
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => setState(() => _showMap = false),
                        style: OutlinedButton.styleFrom(
                          backgroundColor: _showMap
                              ? Colors.white
                              : Colors.black,
                          foregroundColor: _showMap
                              ? Colors.black
                              : Colors.white,
                          side: const BorderSide(color: Colors.black),
                        ),
                        child: const Text('금액 산정'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => setState(() => _showMap = true),
                        style: OutlinedButton.styleFrom(
                          backgroundColor: _showMap
                              ? Colors.black
                              : Colors.white,
                          foregroundColor: _showMap
                              ? Colors.white
                              : Colors.black,
                          side: const BorderSide(color: Colors.black),
                        ),
                        child: const Text('지도'),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),

              // 본문: 금액 / 지도
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    children: [
                      SizedBox(height: 10),
                      if (!_showMap) ...[
                        // 금액 산정 입력들
                        _buildReadOnlyField(
                          '예상 거리(km)',
                          _distanceKm > 0 ? _distanceKm.toStringAsFixed(1) : '',
                        ),
                        const SizedBox(height: 8),

                        _buildTextField('화물 종류', controller: _cargoTypeCtl),
                        const SizedBox(height: 8),

                        // 무게 선택
                        SizedBox(
                          height: 52,
                          child: InputDecorator(
                            decoration: _outlineDecoration('화물 무게'),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<FeesModel>(
                                isExpanded: true,
                                value: _selectedFee,
                                items: _loadingFees
                                    ? []
                                    : _fees
                                          .map(
                                            (f) => DropdownMenuItem(
                                              value: f,
                                              child: Text(
                                                '${f.weight} (기본 ${_money(f.baseCost.toInt())}원)',
                                              ),
                                            ),
                                          )
                                          .toList(),
                                onChanged: (v) =>
                                    setState(() => _selectedFee = v),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),

                        // 예약 시간
                        SizedBox(
                          height: 52,
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Colors.black),
                              backgroundColor: Colors.white,
                            ),
                            onPressed: _pickStartDateTime,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('예약 시간 '),
                                Text(
                                  _startTime == null
                                      ? '선택'
                                      : _fmtKorean(_startTime!),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),

                        // 특이사항 선택
                        SizedBox(
                          height: 52,
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Colors.black),
                              backgroundColor: Colors.white,
                            ),
                            onPressed: _openExtraSelect,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('특이사항 선택'),
                                Text(
                                  _selectedExtraIdx.isEmpty
                                      ? '없음'
                                      : '${_selectedExtraIdx.length}개 선택',
                                ),
                              ],
                            ),
                          ),
                        ),

                        if (_selectedExtraIdx.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F1F1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                for (final i in _selectedExtraIdx)
                                  Text(
                                    '${_extras[i].extraChargeTitle}: +${_money(_extras[i].extraCharge)}원',
                                  ),
                              ],
                            ),
                          ),
                        ],

                        const SizedBox(height: 12),

                        // 금액 요약
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            border: Border.all(color: Colors.black),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _kv('기본 요금', '${_money(_baseCost)}원'),
                              _kv('거리 요금', '${_money(_distanceCost)}원'),
                              _kv('추가 요금', '${_money(_specialCost)}원'),
                              const Divider(height: 18),
                              Text(
                                '총 금액: ${_money(_totalCost)}원',
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                      ] else ...[
                        // 지도
                        SizedBox(
                          width: double.infinity,
                          height: 260,
                          child: WebViewWidget(controller: _webCtrl),
                        ),
                        const SizedBox(height: 12),
                      ],

                      // 하단 액션
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: _calcDistanceAndDraw,
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Colors.black),
                                backgroundColor: Colors.white,
                              ),
                              child: const Text('거리 계산'),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: FilledButton(
                              onPressed: _submitEstimate,
                              child: const Text('견적서 제출'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---------- UI helpers ----------
  InputDecoration _outlineDecoration(String label) => InputDecoration(
    labelText: label,
    floatingLabelStyle: const TextStyle(color: Colors.black),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    filled: true,
    fillColor: Colors.white,
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(24),
      borderSide: const BorderSide(color: Colors.black),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(24),
      borderSide: const BorderSide(color: Colors.black, width: 2),
    ),
  );

  Widget _buildTextField(
    String label, {
    required TextEditingController controller,
  }) {
    return SizedBox(
      height: 52,
      child: TextField(
        controller: controller,
        decoration: _outlineDecoration(label),
      ),
    );
  }

  Widget _buildReadOnlyField(String label, String value) {
    return SizedBox(
      height: 52,
      child: TextField(
        readOnly: true,
        controller: TextEditingController(text: value),
        decoration: _outlineDecoration(label),
      ),
    );
  }

  Widget _buildAddressInput({
    required double width,
    required double height,
    required String label,
    required TextEditingController controller,
    required VoidCallback onPick,
  }) {
    return SizedBox(
      width: width,
      height: height,
      child: TextField(
        controller: controller,
        readOnly: true,
        onTap: onPick,
        decoration: _outlineDecoration(label).copyWith(
          suffixIcon: IconButton(
            icon: const Icon(Icons.search, color: Colors.black),
            onPressed: onPick,
          ),
        ),
      ),
    );
  }

  Widget _kv(String k, String v) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Row(
      children: [
        Text('$k : ', style: const TextStyle(fontWeight: FontWeight.w700)),
        Expanded(child: Text(v)),
      ],
    ),
  );

  String _money(int n) {
    final s = n.toString();
    final buf = StringBuffer();
    for (int i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(',');
      buf.write(s[i]);
    }
    return buf.toString();
  }

  String _fmtKorean(DateTime dt) {
    final am = dt.hour < 12 ? '오전' : '오후';
    final h12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final mm = dt.minute.toString().padLeft(2, '0');
    return '${dt.year}년 ${dt.month.toString().padLeft(2, '0')}월 ${dt.day.toString().padLeft(2, '0')}일 $am $h12:$mm';
  }
}
