// lib/features/driver_delivery/driver_delivery_page.dart
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:intl/intl.dart';

class DriverDeliveryPage extends StatefulWidget {
  const DriverDeliveryPage({super.key});

  @override
  State<DriverDeliveryPage> createState() => _DriverDeliveryPageState();
}

class _DriverDeliveryPageState extends State<DriverDeliveryPage> {
  final Dio dio = Dio(BaseOptions(baseUrl: 'http://10.0.2.2:8080'));

  bool loading = false;
  List<Map<String, dynamic>> deliveries = [];

  // 페이지네이션
  int currentPage = 1;
  int pageSize = 5;

  @override
  void initState() {
    super.initState();
    _fetchDeliveries();
  }

  Future<void> _fetchDeliveries() async {
    setState(() => loading = true);
    try {
      final res = await dio.get('/g2i4/driver/deliveries'); // ✅ API 경로 맞게 교체
      final list = (res.data as List).cast<Map<String, dynamic>>();
      setState(() {
        deliveries = list
            .map((d) => {
                  ...d,
                  "deliveryStatus":
                      d["deliveryStatus"] is int ? d["deliveryStatus"] : 0,
                })
            .toList();
      });
    } catch (e) {
      debugPrint("배송 목록 로딩 실패: $e");
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> _updateDeliveryStatus(int matchingNo, int nextStatus) async {
    try {
      await dio.post(
        '/g2i4/driver/deliveries/$matchingNo/status',
        data: {"status": nextStatus},
      );
    } catch (e) {
      debugPrint("상태 업데이트 실패: $e");
    }
  }

  void _optimisticUpdate(int eno, int nextStatus) {
    setState(() {
      deliveries = deliveries
          .map((row) =>
              row["eno"] == eno ? {...row, "deliveryStatus": nextStatus} : row)
          .toList();
    });
  }

  String _statusLabel(int status) {
    switch (status) {
      case 0:
        return "대기";
      case 1:
        return "배송 중";
      case 2:
        return "완료";
      default:
        return "대기";
    }
  }

  Color _statusColor(int status) {
    switch (status) {
      case 0:
        return Colors.grey;
      case 1:
        return Colors.blue;
      case 2:
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  Widget _renderActionCell(Map<String, dynamic> row) {
    final status = row["deliveryStatus"] as int;
    final eno = row["eno"];
    final matchingNo = row["matchingNo"];

    if (status == 0) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          OutlinedButton(
            onPressed: () {
              // TODO: 상세보기 라우트 연결
            },
            child: const Text("상세보기"),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: () {
              final next = 1;
              _optimisticUpdate(eno, next);
              _updateDeliveryStatus(matchingNo, next);
            },
            child: const Text("배송 시작"),
          ),
        ],
      );
    } else if (status == 1) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          OutlinedButton(
            onPressed: () {
              // TODO: 상세보기 라우트 연결
            },
            child: const Text("상세보기"),
          ),
          const SizedBox(width: 8),
          OutlinedButton(
            style: OutlinedButton.styleFrom(foregroundColor: Colors.orange),
            onPressed: () {
              final next = 0;
              _optimisticUpdate(eno, next);
              _updateDeliveryStatus(matchingNo, next);
            },
            child: const Text("배송 취소"),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            onPressed: () {
              final next = 2;
              _optimisticUpdate(eno, next);
              _updateDeliveryStatus(matchingNo, next);
            },
            child: const Text("배송 완료"),
          ),
        ],
      );
    } else {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          OutlinedButton(
            onPressed: () {
              // TODO: 상세보기 라우트 연결
            },
            child: const Text("상세보기"),
          ),
          const SizedBox(width: 8),
          Chip(
            label: const Text("완료"),
            backgroundColor: Colors.green.shade100,
            labelStyle: const TextStyle(color: Colors.green),
          ),
        ],
      );
    }
  }

  List<Map<String, dynamic>> _filterByStatus(int status) {
    return deliveries.where((d) => d["deliveryStatus"] == status).toList();
  }

  Widget _renderTable(String title, int status) {
    final list = _filterByStatus(status);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        Text(title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 8),
        Card(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: DataTable(
            headingRowColor:
                MaterialStateColor.resolveWith((_) => Colors.grey.shade100),
            columns: const [
              DataColumn(label: Text("화물명")),
              DataColumn(label: Text("무게")),
              DataColumn(label: Text("출발지")),
              DataColumn(label: Text("도착지")),
              DataColumn(label: Text("배송 시작일")),
              DataColumn(label: Text("상세/상태")),
            ],
            rows: list.isEmpty
                ? [
                    const DataRow(cells: [
                      DataCell(Text("데이터가 없습니다.", textAlign: TextAlign.center)),
                      DataCell(SizedBox()),
                      DataCell(SizedBox()),
                      DataCell(SizedBox()),
                      DataCell(SizedBox()),
                      DataCell(SizedBox()),
                    ])
                  ]
                : list.map((row) {
                    return DataRow(cells: [
                      DataCell(Text(row["cargoType"] ?? "-")),
                      DataCell(Text("${row["cargoWeight"] ?? '-'}kg")),
                      DataCell(Text(row["startAddress"] ?? "-")),
                      DataCell(Text(row["endAddress"] ?? "-")),
                      DataCell(Text(
                        row["startTime"] != null
                            ? DateFormat("yyyy-MM-dd")
                                .format(DateTime.parse(row["startTime"]))
                            : "-",
                      )),
                      DataCell(_renderActionCell(row)),
                    ]);
                  }).toList(),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FC),
      appBar: AppBar(
        title: const Text("운전사 배송 관리"),
        centerTitle: true,
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchDeliveries,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _renderTable("배송 대기", 0),
                    _renderTable("배송 중", 1),
                    _renderTable("배송 완료", 2),
                  ],
                ),
              ),
            ),
    );
  }
}
