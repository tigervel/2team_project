class Notice {
  final int noticeId;
  final String title;
  final String authorName;
  final String createdAt;

  Notice({
    required this.noticeId,
    required this.title,
    required this.authorName,
    required this.createdAt,
  });

  factory Notice.fromJson(Map<String, dynamic> json) {
    return Notice(
      noticeId: json['noticeId'],
      title: json['title'],
      authorName: json['authorName'],
      createdAt: json['createdAt'],
    );
  }
}
