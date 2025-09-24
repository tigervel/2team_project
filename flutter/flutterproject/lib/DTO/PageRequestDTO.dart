// lib/DTO/page_request_dto.dart
class PageRequestDTO {
  final int page; // 1-based
  final int size;

  const PageRequestDTO({this.page = 1, this.size = 5});

  Map<String, dynamic> toQuery() => {'page': page, 'size': size};
}
