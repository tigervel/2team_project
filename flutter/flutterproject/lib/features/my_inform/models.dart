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
    final rawAnswered = j['answered'] ?? j['isAnswered'] ?? j['answerYn'];
    final answered = switch (rawAnswered) {
      bool b => b,
      String s => s.toLowerCase() == 'y' || s.toLowerCase() == 'yes' || s.toLowerCase() == 'true',
      num n => n != 0,
      _ => false,
    };
    return Inquiry(
      title: j['title'] ?? j['content'] ?? '',
      createdAt: parsed,
      answered: answered,
      postId: (j['postId'] is int)
          ? j['postId'] as int
          : int.tryParse('${j['postId'] ?? j['id'] ?? j['qnaId'] ?? ''}'),
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
