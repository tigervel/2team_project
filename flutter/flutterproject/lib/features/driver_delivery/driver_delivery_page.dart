// lib/features/driver_delivery/driver_delivery_page.dart
import 'dart:io' show Platform;
import 'dart:math' as math;

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
  static const int _itemsPerPage = 5;
  final Map<_DeliverySection, int> _pageBySection = {
    _DeliverySection.unpaid: 0,
    _DeliverySection.inProgress: 0,
    _DeliverySection.completed: 0,
  };

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

      final normalizedUnpaid =
          unpaidRaw.map((row) => _normalizeRow(row, isOwner: isOwner)).toList();
      final normalizedInProgress =
          inProgressRaw.map((row) => _normalizeRow(row, isOwner: isOwner)).toList();
      final normalizedCompleted =
          completedRaw.map((row) => _normalizeRow(row, isOwner: isOwner)).toList();

      normalizedUnpaid.sort((a, b) => _compareDeliveries(a, b, _DeliverySection.unpaid));
      normalizedInProgress.sort(
        (a, b) => _compareDeliveries(a, b, _DeliverySection.inProgress),
      );
      normalizedCompleted.sort(
        (a, b) => _compareDeliveries(a, b, _DeliverySection.completed),
      );

      if (!mounted) return;
      setState(() {
        userType = type;
        unpaid = normalizedUnpaid;
        inProgress = normalizedInProgress;
        completed = normalizedCompleted;
        _resetPageFor(_DeliverySection.unpaid, unpaid.length);
        _resetPageFor(_DeliverySection.inProgress, inProgress.length);
        _resetPageFor(_DeliverySection.completed, completed.length);
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
    final startTime = row['startTime'] ??
        row['start_time'] ??
        row['startDate'] ??
        row['start_date'] ??
        row['expectedStartDate'] ??
        row['expected_start_date'] ??
        row['pickupDate'] ??
        row['pickup_date'];
    final paymentDueDate =
        row['paymentDueDate'] ?? row['dueDate'] ?? row['paymentDeadline'] ?? row['payment_deadline'];
    final deliveryCompletedAt = row['deliveryCompletedAt'] ??
        row['deliveryEndTime'] ??
        row['completedAt'] ??
        row['completeDate'] ??
        row['complete_date'];
    final createdAt = row['createdAt'] ??
        row['created_at'] ??
        row['createdDate'] ??
        row['created_date'] ??
        row['regDate'] ??
        row['reg_date'] ??
        row['registerDate'] ??
        row['register_date'];
    final updatedAt =
        row['updatedAt'] ?? row['updated_at'] ?? row['modifyDate'] ?? row['modify_date'];

    return {
      ...row,
      'matchingNo': asInt(row['matchingNo']) ?? asInt(row['matching_no']),
      'deliveryStatus': status,
      'cargoType': stringOf(row['cargoType'] ?? row['cargo_name']),
      'cargoWeight': stringOf(row['cargoWeight'] ?? row['cargo_weight']),
      'startAddress': stringOf(row['startAddress'] ?? row['startAddressShort'] ?? row['start_address']),
      'endAddress': stringOf(row['endAddress'] ?? row['endAddressShort'] ?? row['end_address']),
      'startRestAddress': stringOf(
        row['startRestAddress'] ??
            row['startRestAddr'] ??
            row['startDetailAddress'] ??
            row['startAddressDetail'] ??
            row['start_rest_address'] ??
            row['start_detail_address'],
      ),
      'endRestAddress': stringOf(
        row['endRestAddress'] ??
            row['endRestAddr'] ??
            row['endDetailAddress'] ??
            row['endAddressDetail'] ??
            row['end_rest_address'] ??
            row['end_detail_address'],
      ),
      'ordererPhone': stringOf(
        row['ordererPhone'] ??
            row['orderer_phone'] ??
            row['ordererContact'] ??
            row['senderPhone'] ??
            row['sender_phone'],
      ),
      'receiverPhone': stringOf(
        row['receiverPhone'] ??
            row['receiver_phone'] ??
            row['addresseePhone'] ??
            row['destinationPhone'] ??
            row['destination_phone'],
      ),
      'driverName': stringOf(row['driverName'] ?? row['driver_name']),
      'memberName': stringOf(row['memName'] ?? row['memberName'] ?? row['member_name']),
      'startTime': startTime,
      'paymentDueDate': paymentDueDate,
      'deliveryCompletedAt': deliveryCompletedAt,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'isOwner': isOwner,
    };
  }

  DateTime? _parseSortDateTime(dynamic value) {
    if (value == null) return null;
    if (value is DateTime) return value;
    if (value is num) {
      final intValue = value.toInt();
      if (intValue <= 0) return null;
      final digits = intValue.abs().toString();
      if (digits.length == 8) {
        try {
          return DateFormat('yyyyMMdd').parseStrict(digits);
        } catch (_) {
          // fall through
        }
      } else if (digits.length == 14) {
        try {
          return DateFormat('yyyyMMddHHmmss').parseStrict(digits);
        } catch (_) {
          // fall through
        }
      }
      if (digits.length <= 10) {
        return DateTime.fromMillisecondsSinceEpoch(intValue * 1000);
      }
      return DateTime.fromMillisecondsSinceEpoch(intValue);
    }
    if (value is String) {
      final trimmed = value.trim();
      if (trimmed.isEmpty) return null;
      DateTime? parsed = DateTime.tryParse(trimmed);
      parsed ??= DateTime.tryParse(trimmed.replaceFirst(' ', 'T'));
      if (parsed == null && RegExp(r'^\d+$').hasMatch(trimmed)) {
        final numeric = int.tryParse(trimmed);
        if (numeric != null) {
          return _parseSortDateTime(numeric);
        }
      }
      return parsed;
    }
    return null;
  }

  DateTime? _resolveSortDate(Map<String, dynamic> row, _DeliverySection section) {
    final candidates = <dynamic>[
      if (section == _DeliverySection.completed) row['deliveryCompletedAt'],
      if (section == _DeliverySection.completed) row['deliveryEndTime'],
      if (section == _DeliverySection.completed) row['completedAt'],
      row['startTime'],
      row['paymentDueDate'],
      row['createdAt'],
      row['updatedAt'],
      row['matchingDate'] ?? row['matching_date'],
      row['regDate'] ?? row['reg_date'],
    ];

    for (final candidate in candidates) {
      final dt = _parseSortDateTime(candidate);
      if (dt != null) return dt;
    }
    return null;
  }

  int _compareDeliveries(
    Map<String, dynamic> a,
    Map<String, dynamic> b,
    _DeliverySection section,
  ) {
    final dateA = _resolveSortDate(a, section);
    final dateB = _resolveSortDate(b, section);
    if (dateA != null && dateB != null) {
      final diff = dateB.compareTo(dateA);
      if (diff != 0) return diff;
    } else if (dateA != null) {
      return -1;
    } else if (dateB != null) {
      return 1;
    }

    final matchingA = a['matchingNo'] as int?;
    final matchingB = b['matchingNo'] as int?;
    if (matchingA != null && matchingB != null) {
      final diff = matchingB.compareTo(matchingA);
      if (diff != 0) return diff;
    } else if (matchingA != null) {
      return -1;
    } else if (matchingB != null) {
      return 1;
    }

    final idA = a['id']?.toString();
    final idB = b['id']?.toString();
    if (idA != null && idB != null) {
      final diff = idB.compareTo(idA);
      if (diff != 0) return diff;
    }
    return 0;
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
    final trimmed = value.trim();
    if (trimmed.isEmpty) return '-';
    return trimmed;
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

  String _formatPhone(dynamic value) {
    final raw = value?.toString().trim() ?? '';
    if (raw.isEmpty) return '';
    final digits = raw.replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) return raw;

    List<String> parts;
    if (digits.startsWith('02') && (digits.length == 9 || digits.length == 10)) {
      parts = digits.length == 9
          ? ['02', digits.substring(2, 5), digits.substring(5)]
          : ['02', digits.substring(2, 6), digits.substring(6)];
    } else if (digits.length == 11) {
      parts = [digits.substring(0, 3), digits.substring(3, 7), digits.substring(7)];
    } else if (digits.length == 10) {
      parts = [digits.substring(0, 3), digits.substring(3, 6), digits.substring(6)];
    } else if (digits.length > 4) {
      final mid = digits.length - 4;
      parts = [digits.substring(0, 3), digits.substring(3, mid), digits.substring(mid)];
    } else {
      parts = [digits];
    }
    return parts.join('-');
  }

  String _coalesceString(dynamic primary, dynamic fallback) {
    final first = (primary?.toString() ?? '').trim();
    if (first.isNotEmpty) return first;
    final second = (fallback?.toString() ?? '').trim();
    if (second.isNotEmpty) return second;
    return '';
  }

  Future<Map<String, dynamic>?> _fetchOrderSummary(int matchingNo) async {
    try {
      final res = await dio.post('/g2i4/subpath/order/', data: {'mcNo': matchingNo});
      final data = res.data;
      if (data is Map) {
        return Map<String, dynamic>.from(
          data.map((key, value) => MapEntry(key.toString(), value)),
        );
      }
    } catch (e, st) {
      debugPrint('[driver_delivery] order summary fetch failed: $e');
      debugPrintStack(stackTrace: st);
    }
    return null;
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

  Future<void> _promptCompleteDelivery(int? matchingNo) async {
    if (matchingNo == null) return;
    final controller = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        String? errorText;
        return StatefulBuilder(
          builder: (ctx, setState) => AlertDialog(
            title: const Text('배송 완료 확인'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('배송 완료 상태로 변경하려면 "배송 완료"라고 입력하세요.'),
                const SizedBox(height: 12),
                TextField(
                  controller: controller,
                  autofocus: true,
                  decoration: InputDecoration(
                    hintText: '배송 완료',
                    errorText: errorText,
                  ),
                  onSubmitted: (_) {
                    if (controller.text.trim() == '배송 완료') {
                      Navigator.of(ctx).pop(true);
                    } else {
                      setState(() => errorText = '정확히 "배송 완료"를 입력하세요.');
                    }
                  },
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(false),
                child: const Text('취소'),
              ),
              FilledButton(
                onPressed: () {
                  if (controller.text.trim() == '배송 완료') {
                    Navigator.of(ctx).pop(true);
                  } else {
                    setState(() => errorText = '정확히 "배송 완료"를 입력하세요.');
                  }
                },
                child: const Text('확인'),
              ),
            ],
          ),
        );
      },
    );

    if (confirmed == true) {
      await _completeDelivery(matchingNo);
    }
  }

  void _resetPageFor(_DeliverySection section, int itemCount) {
    if (itemCount <= 0) {
      _pageBySection[section] = 0;
      return;
    }
    final maxPage = (itemCount - 1) ~/ _itemsPerPage;
    final current = _pageBySection[section] ?? 0;
    if (current > maxPage) {
      _pageBySection[section] = maxPage;
    }
  }

  void _changePage(_DeliverySection section, int delta, int totalPages) {
    if (totalPages <= 1) return;
    final current = _pageBySection[section] ?? 0;
    final next = current + delta;
    if (next < 0 || next >= totalPages) return;
    setState(() {
      _pageBySection[section] = next;
    });
  }

  void _showDetails(Map<String, dynamic> row) {
    final matchingNo = row['matchingNo'] as int?;
    final future = matchingNo == null ? null : _fetchOrderSummary(matchingNo);
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      builder: (ctx) {
        final status = row['deliveryStatus'] as int? ?? 0;
        return FutureBuilder<Map<String, dynamic>?>(
          future: future,
          builder: (context, snapshot) {
            final extra = snapshot.data;
            final waiting = snapshot.connectionState == ConnectionState.waiting;

            final startRest = _coalesceString(extra?['startRestAddress'], row['startRestAddress']);
            final endRest = _coalesceString(extra?['endRestAddress'], row['endRestAddress']);
            final ordererPhone = _coalesceString(extra?['ordererPhone'], row['ordererPhone']);
            final receiverPhone = _coalesceString(extra?['receiverPhone'], row['receiverPhone']);

            return SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        row['cargoType']?.toString().isEmpty == true ? '상세 정보' : row['cargoType'],
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      if (waiting)
                        const Padding(
                          padding: EdgeInsets.only(bottom: 12),
                          child: LinearProgressIndicator(),
                        ),
                      _detailLine('화물 무게', _formatWeight(row['cargoWeight'] ?? '')),
                      _detailLine('출발지', row['startAddress'] ?? '-'),
                      if (startRest.isNotEmpty) _detailLine('출발 상세 주소', startRest),
                      _detailLine('도착지', row['endAddress'] ?? '-'),
                      if (endRest.isNotEmpty) _detailLine('도착 상세 주소', endRest),
                      if (ordererPhone.isNotEmpty)
                        _detailLine('출발지 휴대전화', _formatPhone(ordererPhone)),
                      if (receiverPhone.isNotEmpty)
                        _detailLine('도착지 휴대전화', _formatPhone(receiverPhone)),
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
                ),
              ),
            );
          },
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

    final totalItems = items.length;
    final totalPages = (totalItems / _itemsPerPage).ceil();
    var currentPage = _pageBySection[section] ?? 0;
    if (currentPage < 0) currentPage = 0;
    if (currentPage >= totalPages) currentPage = totalPages - 1;
    final startIndex = currentPage * _itemsPerPage;
    final endIndex = math.min(startIndex + _itemsPerPage, totalItems);
    final pageItems = items.sublist(startIndex, endIndex);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 8),
        Column(
          children: pageItems.map((row) {
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
                                  Text('출발: ${row['startAddress'] ?? '-'}'),
                                  Text('도착: ${row['endAddress'] ?? '-'}'),
                                  Text('예정일: ${_formatDate(row['startTime'])}'),
                                ],
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
                            onPressed: busy ? null : () => _promptCompleteDelivery(matchingNo),
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
        if (totalPages > 1) ...[
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  onPressed: currentPage == 0
                      ? null
                      : () => _changePage(section, -1, totalPages),
                  icon: const Icon(Icons.chevron_left),
                ),
                Text('${currentPage + 1} / $totalPages'),
                IconButton(
                  onPressed: currentPage >= totalPages - 1
                      ? null
                      : () => _changePage(section, 1, totalPages),
                  icon: const Icon(Icons.chevron_right),
                ),
              ],
            ),
          ),
        ],
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
