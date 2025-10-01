// lib/features/driver_delivery/driver_delivery_page.dart
import 'dart:io' show Platform;

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../API/ApiConfig.dart';
import '../../core/auth_token.dart';

const String _envApiBase = String.fromEnvironment('API_BASE');
const String _envLegacyBase = String.fromEnvironment('BASE_URL');

String _resolveApiBase() {
  if (_envApiBase.isNotEmpty) return _envApiBase;
  if (_envLegacyBase.isNotEmpty) return _envLegacyBase;
  if (kIsWeb) return 'http://localhost:8080';
  if (Platform.isAndroid) return 'http://10.0.2.2:8080';
  if (Platform.isIOS || Platform.isMacOS || Platform.isWindows || Platform.isLinux) {
    return 'http://127.0.0.1:8080';
  }
  return Apiconfig.baseUrl;
}

enum _DeliverySection { unpaid, inProgress, completed }

class DriverDeliveryPage extends StatefulWidget {
  const DriverDeliveryPage({super.key});

  @override
  State<DriverDeliveryPage> createState() => _DriverDeliveryPageState();
}

class _DriverDeliveryPageState extends State<DriverDeliveryPage> {
  late final Dio dio;

  bool loading = true;
  String? userType; // 'MEMBER' | 'CARGO_OWNER'
  List<Map<String, dynamic>> unpaid = [];
  List<Map<String, dynamic>> inProgress = [];
  List<Map<String, dynamic>> completed = [];
  final Set<int> _pendingMatches = <int>{};

  @override
  void initState() {
    super.initState();
    dio = Dio(BaseOptions(
      baseUrl: _resolveApiBase(),
      connectTimeout: const Duration(seconds: 6),
      receiveTimeout: const Duration(seconds: 10),
      sendTimeout: const Duration(seconds: 6),
    ));
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await loadAccessToken();
        if (token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));
    _load();
  }

  Future<void> _load({bool showSpinner = true}) async {
    if (showSpinner && mounted) {
      setState(() => loading = true);
    }
    try {
      final type = await _resolveUserType();
      debugPrint('[driver_delivery] resolved userType: $type');
      final isOwner = type == 'CARGO_OWNER';

      final unpaidRaw = await _fetchList(
        isOwner ? '/g2i4/owner/deliveries/unpaid' : '/g2i4/estimate/subpath/unpaidlist',
      );

      final paidRaw = await _fetchList(
        isOwner ? '/g2i4/owner/deliveries/paid' : '/g2i4/estimate/subpath/paidlist',
      );

      final completedRaw = isOwner
          ? await _fetchList('/g2i4/owner/deliveries/completed')
          : paidRaw.where((row) => _statusFrom(row['deliveryStatus']) == 2).toList();

      final inProgressRaw = isOwner
          ? paidRaw
          : paidRaw.where((row) => _statusFrom(row['deliveryStatus']) != 2).toList();

      if (!mounted) return;
      setState(() {
        userType = type;
        unpaid = unpaidRaw.map((row) => _normalizeRow(row, isOwner: isOwner)).toList();
        inProgress = inProgressRaw.map((row) => _normalizeRow(row, isOwner: isOwner)).toList();
        completed = completedRaw.map((row) => _normalizeRow(row, isOwner: isOwner)).toList();
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('배송 정보를 불러오지 못했습니다: $e')),
        );
      }
    } finally {
      if (showSpinner && mounted) {
        setState(() => loading = false);
      }
    }
  }

  Future<String> _resolveUserType() async {
    try {
      final res = await dio.get('/g2i4/user/info');
      final raw = res.data;
      final direct = raw?['userType'] ?? raw?['type'] ?? raw?['role'] ?? raw?['loginType'];
      if (direct == 'CARGO_OWNER') return 'CARGO_OWNER';
      if (direct == 'MEMBER') return 'MEMBER';
      final nested = raw?['data'] ?? raw?['user'] ?? raw?['payload'] ?? raw?['profile'] ?? raw?['account'] ?? raw?['result'];
      final guess = nested?['userType'] ?? nested?['type'] ?? nested?['role'] ?? nested?['loginType'];
      if (guess == 'CARGO_OWNER') return 'CARGO_OWNER';
      if (guess == 'MEMBER') return 'MEMBER';
    } catch (_) {
      // ignore
    }
    return 'MEMBER';
  }

  Future<List<Map<String, dynamic>>> _fetchList(String path) async {
    try {
      final res = await dio.get(path, queryParameters: const {'page': 1, 'size': 50});
      final list = _asList(res.data);
      debugPrint('[driver_delivery] GET $path -> ${list.length} rows');
      return list;
    } catch (e, st) {
      debugPrint('[driver_delivery] GET $path failed: $e');
      debugPrintStack(stackTrace: st);
      rethrow;
    }
  }

  List<Map<String, dynamic>> _asList(dynamic data) {
    if (data is List) {
      return data.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
    }
    if (data is Map && data['dtoList'] is List) {
      return (data['dtoList'] as List)
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
    }
    return const [];
  }

  Map<String, dynamic> _normalizeRow(Map<String, dynamic> row, {required bool isOwner}) {
    int? asInt(dynamic value) {
      if (value is int) return value;
      if (value is num) return value.toInt();
      if (value is String) return int.tryParse(value.trim());
      return null;
    }

    String stringOf(dynamic value) => value?.toString() ?? '';

    final status = _statusFrom(row['deliveryStatus']);

    return {
      ...row,
      'matchingNo': asInt(row['matchingNo']) ?? asInt(row['matching_no']),
      'deliveryStatus': status,
      'cargoType': stringOf(row['cargoType'] ?? row['cargo_name']),
      'cargoWeight': stringOf(row['cargoWeight'] ?? row['cargo_weight']),
      'startAddress': stringOf(row['startAddress'] ?? row['startAddressShort'] ?? row['start_address']),
      'endAddress': stringOf(row['endAddress'] ?? row['endAddressShort'] ?? row['end_address']),
      'driverName': stringOf(row['driverName'] ?? row['driver_name']),
      'memberName': stringOf(row['memName'] ?? row['memberName'] ?? row['member_name']),
      'paymentDueDate': row['paymentDueDate'] ?? row['dueDate'] ?? row['paymentDeadline'],
      'deliveryCompletedAt': row['deliveryCompletedAt'] ?? row['deliveryEndTime'] ?? row['completedAt'],
      'isOwner': isOwner,
    };
  }

  int _statusFrom(dynamic value) {
    if (value is int) {
      if (value >= 2) return 2;
      if (value == 1) return 1;
      return 0;
    }
    final text = value?.toString().toUpperCase() ?? '';
    if (text == 'IN_TRANSIT' || text == 'DELIVERING') return 1;
    if (text == 'COMPLETED' || text == 'DONE') return 2;
    if (text == '1' || text == '2') return _statusFrom(int.tryParse(text));
    return 0;
  }

  String _statusLabel(int status) {
    switch (status) {
      case 1:
        return '배송 중';
      case 2:
        return '배송 완료';
      default:
        return '대기';
    }
  }

  Color _statusColor(int status) {
    switch (status) {
      case 1:
        return Colors.blue;
      case 2:
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  String _formatWeight(String value) {
    if (value.trim().isEmpty) return '-';
    if (RegExp(r'[A-Za-z]').hasMatch(value)) return value;
    return '$value kg';
  }

  String _formatDate(dynamic value) {
    if (value == null) return '-';
    try {
      DateTime? dt;
      if (value is int) {
        dt = DateTime.fromMillisecondsSinceEpoch(value);
      } else if (value is String) {
        dt = DateTime.tryParse(value) ?? DateTime.tryParse(value.replaceFirst(' ', 'T'));
      }
      dt ??= DateTime.tryParse(value.toString());
      if (dt == null) return '-';
      return DateFormat('yyyy-MM-dd').format(dt);
    } catch (_) {
      return '-';
    }
  }

  String _formatDateTime(dynamic value) {
    if (value == null) return '-';
    try {
      DateTime? dt;
      if (value is int) {
        dt = DateTime.fromMillisecondsSinceEpoch(value);
      } else if (value is String) {
        dt = DateTime.tryParse(value) ?? DateTime.tryParse(value.replaceFirst(' ', 'T'));
      }
      dt ??= DateTime.tryParse(value.toString());
      if (dt == null) return '-';
      return DateFormat('yyyy-MM-dd HH:mm').format(dt);
    } catch (_) {
      return '-';
    }
  }

  Future<void> _startDelivery(int? matchingNo) async {
    if (matchingNo == null || _pendingMatches.contains(matchingNo)) return;
    setState(() => _pendingMatches.add(matchingNo));
    try {
      await dio.post('/g2i4/owner/deliveries/$matchingNo/in_transit');
      await _load(showSpinner: false);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('배송 시작 실패: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _pendingMatches.remove(matchingNo));
      }
    }
  }

  Future<void> _completeDelivery(int? matchingNo) async {
    if (matchingNo == null || _pendingMatches.contains(matchingNo)) return;
    setState(() => _pendingMatches.add(matchingNo));
    try {
      await dio.post('/g2i4/owner/deliveries/$matchingNo/complete');
      await _load(showSpinner: false);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('배송 완료 처리 실패: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _pendingMatches.remove(matchingNo));
      }
    }
  }

  void _showDetails(Map<String, dynamic> row) {
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      builder: (ctx) {
        final status = row['deliveryStatus'] as int? ?? 0;
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                row['cargoType']?.toString().isEmpty == true ? '상세 정보' : row['cargoType'],
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _detailLine('화물 무게', _formatWeight(row['cargoWeight'] ?? '')),
              _detailLine('출발지', row['startAddress'] ?? '-'),
              _detailLine('도착지', row['endAddress'] ?? '-'),
              _detailLine('배송 예정일', _formatDate(row['startTime'])),
              if ((row['driverName'] ?? '').toString().isNotEmpty)
                _detailLine('운전 기사', row['driverName']),
              if ((row['memberName'] ?? '').toString().isNotEmpty)
                _detailLine('의뢰자', row['memberName']),
              if (status == 2)
                _detailLine('완료 시각', _formatDateTime(row['deliveryCompletedAt'])),
              const SizedBox(height: 16),
              Align(
                alignment: Alignment.centerRight,
                child: FilledButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('닫기'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _detailLine(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 96,
            child: Text(label, style: const TextStyle(color: Colors.black54)),
          ),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }

  Widget _buildSection(
    String title,
    List<Map<String, dynamic>> items,
    _DeliverySection section,
  ) {
    final isOwner = userType == 'CARGO_OWNER';
    if (items.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 8),
          Card(
            child: SizedBox(
              width: double.infinity,
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text('$title 항목이 없습니다.', textAlign: TextAlign.center, style: const TextStyle(color: Colors.black54)),
              ),
            ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 8),
        Column(
          children: items.map((row) {
            final status = row['deliveryStatus'] as int? ?? 0;
            final matchingNo = row['matchingNo'] as int?;
            final busy = matchingNo != null && _pendingMatches.contains(matchingNo);

            final badges = <Widget>[
              Chip(
                label: Text(_statusLabel(status)),
                labelStyle: TextStyle(color: _statusColor(status)),
                backgroundColor: _statusColor(status).withOpacity(0.12),
                visualDensity: VisualDensity.compact,
              ),
            ];

            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                (row['cargoType'] as String).isEmpty ? '화물 정보' : row['cargoType'],
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 6),
                              Wrap(
                                spacing: 12,
                                runSpacing: 4,
                                children: [
                                  Text('무게: ${_formatWeight(row['cargoWeight'] ?? '')}'),
                                  Text('출발: ${row['startAddress'] ?? '-'}'),
                                  Text('도착: ${row['endAddress'] ?? '-'}'),
                                  Text('예정일: ${_formatDate(row['startTime'])}'),
                                ],
                              ),
                              if ((row['driverName'] as String).isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Text('운전 기사: ${row['driverName']}'),
                                ),
                              if ((row['memberName'] as String).isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Text('의뢰자: ${row['memberName']}'),
                                ),
                              if (section == _DeliverySection.completed)
                                Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Text('완료 시간: ${_formatDateTime(row['deliveryCompletedAt'])}'),
                                ),
                              if (section == _DeliverySection.unpaid && row['paymentDueDate'] != null)
                                Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Text('결제 기한: ${_formatDate(row['paymentDueDate'])}', style: const TextStyle(color: Colors.orange)),
                                ),
                            ],
                          ),
                        ),
                        Wrap(spacing: 8, children: badges),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        OutlinedButton(
                          onPressed: () => _showDetails(row),
                          child: const Text('상세보기'),
                        ),
                        if (isOwner && section == _DeliverySection.inProgress && status == 0)
                          FilledButton(
                            onPressed: busy ? null : () => _startDelivery(matchingNo),
                            child: busy ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('배송 시작'),
                          ),
                        if (isOwner && section == _DeliverySection.inProgress && status == 1)
                          FilledButton(
                            style: FilledButton.styleFrom(backgroundColor: Colors.green),
                            onPressed: busy ? null : () => _completeDelivery(matchingNo),
                            child: busy ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('배송 완료'),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final isOwner = userType == 'CARGO_OWNER';

    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      appBar: AppBar(
        title: Text(isOwner ? '운전사 배송 관리' : '나의 배송 관리'),
      ),
      body: RefreshIndicator(
        onRefresh: () => _load(showSpinner: false),
        child: ListView(
          padding: const EdgeInsets.all(16),
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            Text(
              '로그인 유형: ${isOwner ? '화물(차량) 소유자' : '일반 회원'}',
              style: const TextStyle(color: Colors.black54),
            ),
            const SizedBox(height: 16),
            _buildSection('미결제 · 대기', unpaid, _DeliverySection.unpaid),
            const SizedBox(height: 32),
            _buildSection('결제됨 · 진행 중', inProgress, _DeliverySection.inProgress),
            const SizedBox(height: 32),
            _buildSection('배송 완료', completed, _DeliverySection.completed),
          ],
        ),
      ),
    );
  }
}
