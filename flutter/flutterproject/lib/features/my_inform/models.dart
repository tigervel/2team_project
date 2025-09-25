class Inquiry {
  final String title;
  final DateTime createdAt;
  final bool answered;
  final int? postId;

  Inquiry({
    required this.title,
    required this.createdAt,
    required this.answered,
    this.postId,
  });

  factory Inquiry.fromJson(Map<String, dynamic> j) {
    final rawDate = j['createdAt'] ?? j['created_at'] ?? j['regDate'];
    final parsed = DateTime.tryParse('$rawDate'.replaceFirst(' ', 'T')) ?? DateTime.now();
    return Inquiry(
      title: j['title'] ?? '',
      createdAt: parsed,
      answered: j['answered'] == true,
      postId: (j['postId'] is int) ? j['postId'] : null,
    );
  }
}

class MonthlyPoint {
  final int year;
  final int month;
  final int value;

  MonthlyPoint({required this.year, required this.month, required this.value});

  factory MonthlyPoint.fromJson(Map<String, dynamic> j) => MonthlyPoint(
        year: j['year'] as int,
        month: j['month'] as int,
        value: (j['revenue'] ?? j['value'] ?? 0) as int,
      );
}
