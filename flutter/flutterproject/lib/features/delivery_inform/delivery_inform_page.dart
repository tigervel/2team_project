import 'dart:io' show Platform;
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import '../../core/auth_token.dart';

class DeliveryInformPage extends StatefulWidget {
  const DeliveryInformPage({super.key});

  @override
  State<DeliveryInformPage> createState() => _DeliveryInformPageState();
}

class _DeliveryInformPageState extends State<DeliveryInformPage> {
  late final String apiBase = kIsWeb
      ? 'http://localhost:8080'
      : (Platform.isAndroid ? 'http://10.0.2.2:8080' : 'http://localhost:8080');

  late final Dio dio;

  String userType = 'MEMBER'; // 기본값
  bool loading = true;

  List<Map<String, dynamic>> unpaidList = [];
  List<Map<String, dynamic>> paidList = [];
  List<Map<String, dynamic>> completedList = [];

  @override
  void initState() {
    super.initState();
    dio = Dio(BaseOptions(
      baseUrl: apiBase,
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 8),
      sendTimeout: const Duration(seconds: 5),
    ))
      ..interceptors.add(LogInterceptor(
        request: true,
        requestBody: true,
        responseHeader: false,
        responseBody: true,
      ));
    _load();
  }

  Future<Map<String, String>> _authHeaders() async {
    final token = await loadAccessToken();
    if (token.isEmpty) return {};
    return {'Authorization': 'Bearer $token'};
  }

  List<Map<String, dynamic>> _extractList(dynamic data) {
    if (data is List) {
      return data
          .map<Map<String, dynamic>>((e) => Map<String, dynamic>.from(e as Map))
          .toList();
    }
    if (data is Map && data['dtoList'] is List) {
      return (data['dtoList'] as List)
          .map<Map<String, dynamic>>((e) => Map<String, dynamic>.from(e as Map))
          .toList();
    }
    return [];
  }

  Future<void> _load() async {
    setState(() => loading = true);
    try {
      final headers = await _authHeaders();
      final options = headers.isEmpty ? null : Options(headers: headers);

      if (options == null) {
        userType = 'MEMBER';
        unpaidList = [];
        paidList = [];
        completedList = [];
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('로그인이 필요합니다. 다시 로그인해 주세요.')),
          );
        }
        return;
      }

      // 1) 미탑성 타입
      try {
        final res = await dio.get('/g2i4/user/info', options: options);
        final data = res.data;
        final raw = (data is Map) ? (data['userType'] ?? data['role']) : null;
        if (raw == 'CARGO_OWNER') {
          userType = 'CARGO_OWNER';
        } else {
          userType = 'MEMBER';
        }
      } catch (_) {
        userType = 'MEMBER';
      }

      // 2) 수락일정
      try {
        final res = (userType == 'MEMBER')
            ? await dio.get('/g2i4/member/estimates/unpaid', options: options)
            : await dio.get('/g2i4/owner/deliveries/unpaid', options: options);
        unpaidList = _extractList(res.data);
      } catch (_) {
        unpaidList = [];
      }

      // 3) 거래현황
      try {
        final res = (userType == 'MEMBER')
            ? await dio.get('/g2i4/member/estimates/paid', options: options)
            : await dio.get('/g2i4/owner/deliveries/paid', options: options);
        paidList = _extractList(res.data);
      } catch (_) {
        paidList = [];
      }

      // 4) 완료내역
      try {
        final res = (userType == 'MEMBER')
            ? await dio.get('/g2i4/member/estimates/completed',
                options: options)
            : await dio.get('/g2i4/owner/deliveries/completed',
                options: options);
        completedList = _extractList(res.data);
      } catch (_) {
        completedList = [];
      }
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  String _fmtDate(dynamic v) {
    if (v == null) return '-';
    try {
      final d = v is num
          ? DateTime.fromMillisecondsSinceEpoch(v.toInt())
          : DateTime.tryParse(v.toString().replaceFirst(' ', 'T'));
      if (d == null) return '-';
      return '${d.year}-${_two(d.month)}-${_two(d.day)}';
    } catch (_) {
      return '-';
    }
  }

  String _two(int n) => n < 10 ? '0$n' : '$n';

  void _showReportSheet(String matchingNo) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) {
        final ctrl = TextEditingController();
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('신고하기',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              TextField(
                controller: ctrl,
                decoration: const InputDecoration(
                  labelText: '사유',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('취소'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: FilledButton(
                      onPressed: () async {
                        try {
                          final headers = await _authHeaders();
                          final postOptions = headers.isEmpty
                              ? null
                              : Options(headers: headers);
                          if (postOptions == null) {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('로그인이 필요합니다.')),
                              );
                            }
                            return;
                          }
                          await dio.post('/g2i4/report/$matchingNo',
                              data: {'reason': ctrl.text},
                              options: postOptions);
                          if (ctx.mounted) Navigator.pop(ctx);
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('�Ű��� �����Ǿ����ϴ�.')),
                            );
                          }
                        } catch (e) {
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('�Ű� ����: $e')),
                            );
                          }
                        }
                      },
                      child: const Text('신고'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final isMember = userType == 'MEMBER';

    return Scaffold(
      appBar: AppBar(
        title: Text(isMember ? '배송 정보 관리' : '차주 배송 관리'),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildExpandableList(
              title: isMember ? '견적 의뢰 진행 상황 (미결제)' : '미결제 배송 요청',
              data: unpaidList,
              isMember: isMember,
            ),
            _buildExpandableList(
              title: isMember ? '견적 의뢰 진행 상황 (결제됨)' : '진행 중 배송 (결제됨)',
              data: paidList,
              isMember: isMember,
            ),
            _buildExpandableList(
              title: isMember ? '배송 완료 된 화물' : '완료된 배송',
              data: completedList,
              isMember: isMember,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExpandableList({
    required String title,
    required List<Map<String, dynamic>> data,
    required bool isMember,
  }) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (data.isEmpty)
              const Padding(
                padding: EdgeInsets.all(16),
                child: Text("항목 없음"),
              )
            else
              ...data.map((row) {
                final cargoName = row['cargoName'] ?? row['cargoType'] ?? '-';
                final status = row['status'] ?? row['deliveryStatus'] ?? '대기';
                final matchingNo =
                    row['matchingNo'] ?? row['mno'] ?? row['matching_no'];
                return ExpansionTile(
                  title: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(cargoName),
                      Text(status, style: const TextStyle(color: Colors.blue)),
                    ],
                  ),
                  children: [
                    _detailRow("무게", "${row['cargoWeight'] ?? '-'}"),
                    _detailRow("출발지",
                        row['startAddressShort'] ?? row['startAddress'] ?? '-'),
                    _detailRow("도착지",
                        row['endAddressShort'] ?? row['endAddress'] ?? '-'),
                    _detailRow("시작일", _fmtDate(row['startTime'])),
                    if (isMember)
                      _detailRow("운전기사", row['driverName'] ?? '-')
                    else
                      _detailRow("의뢰자", row['memName'] ?? '-'),
                    if (isMember)
                      Align(
                        alignment: Alignment.centerRight,
                        child: OutlinedButton(
                          onPressed: matchingNo == null
                              ? null
                              : () => _showReportSheet(matchingNo.toString()),
                          child: const Text("신고"),
                        ),
                      ),
                    const SizedBox(height: 8),
                  ],
                );
              }),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
          Text(value),
        ],
      ),
    );
  }
}
