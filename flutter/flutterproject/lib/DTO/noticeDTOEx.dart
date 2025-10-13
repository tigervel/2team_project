import 'package:flutter/foundation.dart';

/// 공지사항 카테고리 Enum
enum NoticeCategory {
  all('ALL', '전체'),
  general('GENERAL', '사용안내'),
  system('SYSTEM', '시스템'),
  service('SERVICE', '서비스'),
  update('UPDATE', '업데이트');

  final String value;
  final String displayName;

  const NoticeCategory(this.value, this.displayName);

  static NoticeCategory fromString(String value) {
    return NoticeCategory.values.firstWhere(
      (category) => category.value == value,
      orElse: () => NoticeCategory.general,
    );
  }
}

/// 공지사항 모델
@immutable
class Notice {
  final int noticeId;
  final String title;
  final String content;
  final String authorId;
  final String authorName;
  final String createdAt;
  final String? updatedAt;
  final int viewCount;
  final NoticeCategory category;
  final int? displayNumber;

  const Notice({
    required this.noticeId,
    required this.title,
    required this.content,
    required this.authorId,
    required this.authorName,
    required this.createdAt,
    this.updatedAt,
    required this.viewCount,
    required this.category,
    this.displayNumber,
  });

  /// JSON → Notice 변환
  factory Notice.fromJson(Map<String, dynamic> json) {
    return Notice(
      noticeId: json['noticeId'] as int,
      title: json['title'] as String,
      content: json['content'] as String? ?? '',
      authorId: json['authorId'] as String? ?? '',
      authorName: json['authorName'] as String,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String?,
      viewCount: json['viewCount'] as int? ?? 0,
      category: NoticeCategory.fromString(json['category'] as String? ?? 'GENERAL'),
      displayNumber: json['displayNumber'] as int?,
    );
  }

  /// Notice → JSON 변환
  Map<String, dynamic> toJson() {
    return {
      'noticeId': noticeId,
      'title': title,
      'content': content,
      'authorId': authorId,
      'authorName': authorName,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'viewCount': viewCount,
      'category': category.value,
      'displayNumber': displayNumber,
    };
  }

  /// copyWith 메서드 (상태 업데이트용)
  Notice copyWith({
    int? noticeId,
    String? title,
    String? content,
    String? authorId,
    String? authorName,
    String? createdAt,
    String? updatedAt,
    int? viewCount,
    NoticeCategory? category,
    int? displayNumber,
  }) {
    return Notice(
      noticeId: noticeId ?? this.noticeId,
      title: title ?? this.title,
      content: content ?? this.content,
      authorId: authorId ?? this.authorId,
      authorName: authorName ?? this.authorName,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      viewCount: viewCount ?? this.viewCount,
      category: category ?? this.category,
      displayNumber: displayNumber ?? this.displayNumber,
    );
  }

  @override
  String toString() {
    return 'Notice(noticeId: $noticeId, title: $title, category: ${category.displayName})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Notice && other.noticeId == noticeId;
  }

  @override
  int get hashCode => noticeId.hashCode;
}

/// 페이지네이션 응답 모델
@immutable
class NoticePageResponse {
  final List<Notice> content;
  final int totalElements;
  final int totalPages;
  final int currentPage;
  final int size;
  final bool hasNext;
  final bool hasPrevious;
  final bool isFirst;
  final bool isLast;

  const NoticePageResponse({
    required this.content,
    required this.totalElements,
    required this.totalPages,
    required this.currentPage,
    required this.size,
    required this.hasNext,
    required this.hasPrevious,
    required this.isFirst,
    required this.isLast,
  });

  /// JSON → NoticePageResponse 변환
  factory NoticePageResponse.fromJson(Map<String, dynamic> json) {
    final contentList = json['content'] as List<dynamic>;
    return NoticePageResponse(
      content: contentList.map((item) => Notice.fromJson(item as Map<String, dynamic>)).toList(),
      totalElements: json['totalElements'] as int,
      totalPages: json['totalPages'] as int,
      currentPage: json['currentPage'] as int,
      size: json['size'] as int,
      hasNext: json['hasNext'] == true,
      hasPrevious: json['hasPrevious'] ==true,
      isFirst: json['isFirst'] ?? false,
      isLast: json['isLast'] ?? false,
    );
  }

  /// NoticePageResponse → JSON 변환
  Map<String, dynamic> toJson() {
    return {
      'content': content.map((notice) => notice.toJson()).toList(),
      'totalElements': totalElements,
      'totalPages': totalPages,
      'currentPage': currentPage,
      'size': size,
      'hasNext': hasNext,
      'hasPrevious': hasPrevious,
      'isFirst': isFirst,
      'isLast': isLast,
    };
  }

  @override
  String toString() {
    return 'NoticePageResponse(currentPage: $currentPage, totalPages: $totalPages, items: ${content.length})';
  }
}

/// 공지사항 작성 요청 모델
@immutable
class CreateNoticeRequest {
  final String title;
  final String content;
  final String author;
  final NoticeCategory category;

  const CreateNoticeRequest({
    required this.title,
    required this.content,
    required this.author,
    required this.category,
  });

  /// CreateNoticeRequest → JSON 변환
  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'content': content,
      'author': author,
      'category': category.value,
    };
  }

  @override
  String toString() {
    return 'CreateNoticeRequest(title: $title, category: ${category.displayName})';
  }
}

/// 공지사항 수정 요청 모델
@immutable
class UpdateNoticeRequest {
  final String title;
  final String content;
  final String author;
  final NoticeCategory category;

  const UpdateNoticeRequest({
    required this.title,
    required this.content,
    required this.author,
    required this.category,
  });

  /// UpdateNoticeRequest → JSON 변환
  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'content': content,
      'author': author,
      'category': category.value,
    };
  }

  @override
  String toString() {
    return 'UpdateNoticeRequest(title: $title, category: ${category.displayName})';
  }
}
