import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutterproject/API/FeesApi.dart';
import 'package:kpostal/kpostal.dart';
import 'package:flutterproject/Model/FeesModel.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:dio/dio.dart';

class Simpleinquiry extends StatefulWidget {
  const Simpleinquiry({super.key});

  @override
  State<Simpleinquiry> createState() => _SimpleinquiryState();
}

class _SimpleinquiryState extends State<Simpleinquiry> {
  final FeesApi api = FeesApi();
  List<FeesModel> fees = [];
  FeesModel? selected;

  final TextEditingController _startCtl = TextEditingController();
  final TextEditingController _endCtl   = TextEditingController();

  late final WebViewController _webCtrl;
  final Dio dio = Dio(BaseOptions(baseUrl: "http://10.0.2.2:8080"));

  @override
  void initState() {
    super.initState();
    _loadFees();

    _webCtrl = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadFlutterAsset("assets/kakao_map.html");
  }

  Future<void> _loadFees() async {
    try {
      final result = await api.fetchFees();
      setState(() => fees = result);
    } catch (e) {
      debugPrint("API 호출 실패: $e");
    }
  }

  Future<void> _pickAddress({required bool isStart}) async {
    final Kpostal? result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => KpostalView()),
    );

    if (result != null && mounted) {
      setState(() {
        if (isStart) {
          _startCtl.text = result.address;
        } else {
          _endCtl.text = result.address;
        }
      });
    }
  }

  Future<void> _onQuery() async {
  final start = _startCtl.text.trim();
  final end   = _endCtl.text.trim();
  if (start.isEmpty || end.isEmpty || selected == null) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("출발지, 도착지, 화물 무게를 입력하세요.")),
    );
    return;
  }

  try {
    // 🚀 백엔드 호출 (출발지/도착지 → 좌표/경로)
    final res = await dio.get("/api/map/directions", queryParameters: {
      "startAddress": start,
      "endAddress": end,
    });

    final data = res.data;
    final distance = data['distance']; // m 단위
    final path = (data['path'] as List).cast<List>();

    // 🚀 WebView에 JS 호출 → HTML 안의 drawRoute() 실행
    final js = "drawRoute(${jsonEncode(path)});";
    await _webCtrl.runJavaScript(js);

    // 🚚 요금 계산
    final km = distance / 1000.0;
    final total = selected!.baseCost.toInt() + (km * selected!.ratePerKm.toInt()).round();

    // 결과 모달
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("예상 견적"),
        content: Text("거리: ${km.toStringAsFixed(1)} km\n예상 요금: $total 원\n본 금액은 예상 견적이며 물품에 따라 상세금액과 차이가 있을 수 있습니다"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("확인"),
          ),
        ],
      ),
    );
  } catch (e) {
    debugPrint("경로조회 실패: $e");
  }
}
  @override
  void dispose() {
    _startCtl.dispose();
    _endCtl.dispose();
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
              // 상단 바
              // Container(
              //   height: height * 0.06,
              //   width: double.infinity,
              //   color: const Color(0xFFBFAFA9),
              //   alignment: Alignment.centerRight,
              //   padding: const EdgeInsets.symmetric(horizontal: 12),
              //   child: const Text("로그인 / 회원가입"),
              // ),

              SizedBox(height: height * 0.02),
              const Text("간편 조회",
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              SizedBox(height: height * 0.02),

              Icon(Icons.local_shipping, size: height * 0.1, color: Colors.white),
              SizedBox(height: height * 0.02),

              _buildAddressInput(
                width: width * 0.8,
                height: height * 0.06,
                label: "출발지",
                controller: _startCtl,
                onPick: () => _pickAddress(isStart: true),
              ),
              SizedBox(height: height * 0.015),
              _buildAddressInput(
                width: width * 0.8,
                height: height * 0.06,
                label: "도착지",
                controller: _endCtl,
                onPick: () => _pickAddress(isStart: false),
              ),
              SizedBox(height: height * 0.015),

              SizedBox(
                width: width * 0.8,
                height: height * 0.06,
                child: DropdownButtonFormField<FeesModel>(
                  isExpanded: true,
                  value: selected,
                  decoration: InputDecoration(
                    labelText: "화물 무게",
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: const BorderSide(color: Colors.black),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: const BorderSide(color: Colors.black, width: 2),
                    ),
                  ),
                  items: fees.map((e) => DropdownMenuItem(
                    value: e,
                    child: Text('${e.weight} (기본요금 ${e.baseCost.toInt()}원)'),
                  )).toList(),
                  onChanged: (v) => setState(() => selected = v),
                ),
              ),

              SizedBox(height: height * 0.02),

              // ✅ 지도 WebView
              SizedBox(
                width: width * 0.8,
                height: height * 0.25,
                child: WebViewWidget(controller: _webCtrl),
              ),
              const SizedBox(height: 8),

              SizedBox(
                width: width * 0.35,
                height: height * 0.05,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.black),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                    backgroundColor: Colors.white,
                  ),
                  onPressed: _onQuery,
                  child: const Text("간편조회", style: TextStyle(color: Colors.black)),
                ),
              ),
              SizedBox(height: height * 0.02),
            ],
          ),
        ),
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
        decoration: InputDecoration(
          labelText: label,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          filled: true,
          fillColor: Colors.white,
          suffixIcon: IconButton(
            icon: const Icon(Icons.search, color: Colors.black),
            onPressed: onPick,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(24),
            borderSide: const BorderSide(color: Colors.black),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(24),
            borderSide: const BorderSide(color: Colors.black, width: 2),
          ),
        ),
      ),
    );
  }
}
