import 'package:intl/intl.dart';

List<Map<String, int>> makeLast6MonthBuckets() {
  final now = DateTime.now();
  final buckets = <Map<String, int>>[];
  for (var i = 5; i >= 0; i--) {
    final d = DateTime(now.year, now.month - i, 1);
    buckets.add({'y': d.year, 'm': d.month});
  }
  return buckets;
}

DateTime? extractEstimateDate(Map<String, dynamic> it) {
  final candidates = [
    it['startTime'], it['start_time'],
    it['orderTime'], it['order_time'],
    it['createdAt'], it['created_at'], it['regDate'], it['reg_date'],
  ];
  for (final raw in candidates) {
    if (raw == null) continue;
    final s = '$raw'.replaceFirst(' ', 'T');
    final d = DateTime.tryParse(s);
    if (d != null) return d;
  }
  return null;
}

String monthLabel(int m) => '$m월';
String currency(num n) => NumberFormat('#,###').format(n);
