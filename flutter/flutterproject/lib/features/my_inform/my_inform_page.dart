import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutterproject/API/ApiConfig.dart';
import 'package:intl/intl.dart';
import '../../core/api_client.dart';
import 'models.dart';
import 'repository.dart';
import 'utils.dart';

// 컴파일 타임 상수로만 읽는다 (비어있을 수 있음)
const String _envApiBase = String.fromEnvironment('API_BASE', defaultValue: '');

class MyInformPage extends StatefulWidget {
  const MyInformPage({super.key});

  @override
  State<MyInformPage> createState() => _MyInformPageState();
}

class _MyInformPageState extends State<MyInformPage> {
  // 최종 사용할 베이스 URL (런타임에 결정: env 우선, 없으면 ApiConfig)
  late final String apiBase;

  late final MyInformRepository repo;

  String? userType; // 'MEMBER' | 'CARGO_OWNER'
  bool loading = true;

  // 회원 카드
  int totalOrders = 0;
  // 공통
  int inTransitCount = 0;
  int completedCount = 0;
  // 차주 카드
  int totalDeliveries = 0;

  // 차트: 최근 6개월
  List<Map<String, dynamic>> buckets = [];
  // 문의 내역
  List<Inquiry> inquiries = [];

  @override
  void initState() {
    super.initState();
    // 환경 변수 우선, 비어있으면 ApiConfig의 자동감지 사용
    apiBase = _envApiBase.isNotEmpty ? _envApiBase : Apiconfig.baseUrl;
    _init();
  }

  Future<void> _init() async {
    final client = await ApiClient.create(baseUrl: apiBase);
    repo = MyInformRepository(client.dio);
    await _load();
  }

  Future<void> _load() async {
    setState(() => loading = true);
    try {
      final t = await repo.fetchUserType();
      if (t == 'MEMBER') {
        final all = await repo.getMyAllEstimateList();
        final paid = await repo.getMyPaidEstimateList();
        final inTransit = paid
            .where((it) => (it['deliveryStatus'] ?? it['status']) == 'IN_TRANSIT')
            .length;
        final completed = paid
            .where((it) => (it['deliveryStatus'] ?? it['status']) == 'COMPLETED')
            .length;

        final _b = makeLast6MonthBuckets()
            .map((b) => {'y': b['y']!, 'm': b['m']!, 'value': 0})
            .toList();
        for (final it in all) {
          final d = extractEstimateDate(it);
          if (d == null) continue;
          final hit = _b.firstWhere(
            (b) => b['y'] == d.year && b['m'] == d.month,
            orElse: () => {},
          );
          if (hit.isNotEmpty) hit['value'] = (hit['value'] as int) + 1;
        }

        final qnas = await repo.getMyInquiries(10);

        setState(() {
          userType = 'MEMBER';
          totalOrders = all.length;
          inTransitCount = inTransit;
          completedCount = completed;
          totalDeliveries = 0;
          buckets = _b;
          inquiries = qnas;
        });
      } else {
        final paid = await repo.getOwnerPaidList();
        final completed = await repo.getOwnerCompletedList();
        final revenue = await repo.getOwnerMonthlyRevenue();
        final inTransit = paid
            .where((it) => (it['deliveryStatus'] ?? it['status']) == 'IN_TRANSIT')
            .length;

        final _b = makeLast6MonthBuckets()
            .map((b) => {'y': b['y']!, 'm': b['m']!, 'value': 0})
            .toList();
        for (final r in revenue) {
          final hit = _b.firstWhere(
            (b) => b['y'] == r.year && b['m'] == r.month,
            orElse: () => {},
          );
          if (hit.isNotEmpty) hit['value'] = r.value;
        }

        final qnas = await repo.getMyInquiries(10);

        setState(() {
          userType = 'CARGO_OWNER';
          totalOrders = 0;
          inTransitCount = inTransit;
          completedCount = completed.length;
          totalDeliveries = paid.length + completed.length;
          buckets = _b;
          inquiries = qnas;
        });
      }
    } catch (e) {
      // 실패 시 초기화
      setState(() {
        userType = userType ?? 'MEMBER';
        totalOrders = 0;
        inTransitCount = 0;
        completedCount = 0;
        totalDeliveries = 0;
        buckets = [];
        inquiries = [];
      });
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading || userType == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final isMember = userType == 'MEMBER';
    final cards = isMember
        ? [
            ('총 주문건수', '${totalOrders}건'),
            ('배송 중', '${inTransitCount}건'),
            ('배송 완료', '${completedCount}건'),
          ]
        : [
            ('총 배달 건수', '${totalDeliveries}건'),
            ('배송 중', '${inTransitCount}건'),
            ('배송 완료', '${completedCount}건'),
          ];

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        title: Text(isMember ? '배송 정보 관리 (회원)' : '배송 정보 관리 (차주)'),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: LayoutBuilder(
          builder: (context, c) {
            final isWide = c.maxWidth >= 900;
            return SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // 상태 카드
                  Row(
                    children: List.generate(3, (i) {
                      final (label, value) = cards[i];
                      return Expanded(
                        child: Padding(
                          padding: EdgeInsets.only(right: i < 2 ? 12 : 0),
                          child: Card(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: SizedBox(
                              height: 100,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    label,
                                    style: Theme.of(context)
                                        .textTheme
                                        .labelMedium
                                        ?.copyWith(color: Colors.grey[700]),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    value,
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleMedium
                                        ?.copyWith(fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
                  ),

                  const SizedBox(height: 16),

                  // 그래프 + 문의내역
                  if (isWide) ...[
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: _ChartCard(
                            title: isMember ? '월별 요청 수' : '월별 수익',
                            legend: isMember ? '요청 수' : '수익',
                            isOwner: !isMember,
                            buckets: buckets,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(child: _InquiryCard(inquiries: inquiries)),
                      ],
                    ),
                  ] else ...[
                    SizedBox(
                      width: double.infinity,
                      child: _ChartCard(
                        title: isMember ? '월별 요청 수' : '월별 수익',
                        legend: isMember ? '요청 수' : '수익',
                        isOwner: !isMember,
                        buckets: buckets,
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: _InquiryCard(inquiries: inquiries),
                    ),
                  ],
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _ChartCard extends StatelessWidget {
  final String title;
  final String legend;
  final bool isOwner;
  final List<Map<String, dynamic>> buckets;

  const _ChartCard({
    required this.title,
    required this.legend,
    required this.isOwner,
    required this.buckets,
  });

  @override
  Widget build(BuildContext context) {
    final labels = buckets.map((b) => monthLabel(b['m'] as int)).toList();
    final values = buckets.map((b) => (b['value'] as num).toDouble()).toList();
    final maxVal = values.isEmpty ? 0.0 : (values.reduce((a, b) => a > b ? a : b));

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: SizedBox(
          height: 320,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context)
                    .textTheme
                    .labelLarge
                    ?.copyWith(color: Colors.grey[700]),
              ),
              const SizedBox(height: 8),
             
              const SizedBox(height: 8),
              Expanded(
                child: BarChart(
                  BarChartData(
                    barGroups: List.generate(values.length, (i) {
                      return BarChartGroupData(
                        x: i,
                        barRods: [
                          BarChartRodData(
                            toY: values[i],
                            width: 18,
                            borderRadius: BorderRadius.circular(4),
                            color: Colors.purple,
                          ),
                        ],
                      );
                    }),
                    gridData: FlGridData(show: true, drawVerticalLine: false),
                    borderData: FlBorderData(show: false),
                    titlesData: FlTitlesData(
                      leftTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          reservedSize: 70,
                          getTitlesWidget: (v, _) {
                            final num n = v;
                            final text = isOwner
                                ? '${NumberFormat('#,###').format(n)}원'
                                : '${n.toInt()}건';
                            return Text(text, style: const TextStyle(fontSize: 10));
                          },
                        ),
                      ),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (v, _) {
                            final i = v.toInt();
                            if (i >= 0 && i < labels.length) {
                              return Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(labels[i],
                                    style: const TextStyle(fontSize: 10)),
                              );
                            }
                            return const SizedBox.shrink();
                          },
                        ),
                      ),
                      topTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false),
                      ),
                      rightTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false),
                      ),
                    ),
                    maxY: (maxVal == 0)
                        ? 1
                        : (isOwner ? (maxVal * 1.2) : (maxVal + 1)).toDouble(),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InquiryCard extends StatelessWidget {
  final List<Inquiry> inquiries;
  const _InquiryCard({required this.inquiries});

  @override
  Widget build(BuildContext context) {
    final rows = inquiries.isEmpty
        ? const [
            DataRow(cells: [
              DataCell(Center(child: Text('최근 문의가 없습니다.'))),
              DataCell(SizedBox()),
              DataCell(SizedBox()),
            ])
          ]
        : inquiries.map((i) {
            final status = i.answered ? '답변 완료' : '미답변';
            final date = DateFormat('yyyy-MM-dd').format(i.createdAt);
            final clickable = i.answered;
            return DataRow(
              cells: [
                DataCell(
                  Text(
                    i.title,
                    style: TextStyle(
                      decoration: clickable
                          ? TextDecoration.underline
                          : TextDecoration.none,
                    ),
                  ),
                  onTap: clickable
                      ? () {
                          // Flutter Web이면 Navigator로 /qaboard 등으로 이동 가능
                          // Navigator.pushNamed(context, '/qaboard');
                        }
                      : null,
                ),
                DataCell(Center(child: Text(date))),
                DataCell(
                  Center(
                    child: Text(
                      status,
                      style: TextStyle(
                        color: i.answered ? Colors.green : Colors.red,
                      ),
                    ),
                  ),
                ),
              ],
            );
          }).toList();

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: SizedBox(
          height: 320,
          child: Column(
            children: [
              Text(
                '내 문의 내역',
                style: Theme.of(context)
                    .textTheme
                    .labelLarge
                    ?.copyWith(color: Colors.grey[700]),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: SingleChildScrollView(
                  scrollDirection: Axis.vertical,
                  child: DataTable(
                    headingRowHeight: 36,
                    dataRowMinHeight: 40,
                    dataRowMaxHeight: 56,
                    columns: const [
                      DataColumn(label: Center(child: Text('문의내용'))),
                      DataColumn(label: Center(child: Text('작성일'))),
                      DataColumn(label: Center(child: Text('답변여부'))),
                    ],
                    rows: rows,
                    columnSpacing: 16,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
