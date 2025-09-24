// lib/DTO/page_response_dto.dart
typedef ItemParser<T> = T Function(Map<String, dynamic>);

class PageResponseDTO<T> {
  final List<T> dtoList;
  final List<int> pageNumList;
  final bool prev;
  final bool next;
  final int totalCount;
  final int prevPage;
  final int nextPage;
  final int totalPage;
  final int current;

  PageResponseDTO({
    required this.dtoList,
    required this.pageNumList,
    required this.prev,
    required this.next,
    required this.totalCount,
    required this.prevPage,
    required this.nextPage,
    required this.totalPage,
    required this.current,
  });

  factory PageResponseDTO.fromJson(
    Map<String, dynamic> json,
    ItemParser<T> parseItem,
  ) {
    final list = (json['dtoList'] as List? ?? [])
        .map((e) => parseItem(Map<String, dynamic>.from(e as Map)))
        .toList();

    return PageResponseDTO<T>(
      dtoList: list,
      pageNumList:
          (json['pageNumList'] as List? ?? []).map((e) => int.parse('$e')).toList(),
      prev: json['prev'] == true,
      next: json['next'] == true,
      totalCount: int.tryParse('${json['totalCount']}') ?? 0,
      prevPage: int.tryParse('${json['prevPage']}') ?? 0,
      nextPage: int.tryParse('${json['nextPage']}') ?? 0,
      totalPage: int.tryParse('${json['totalPage'] ?? json['tatalPage']}') ?? 0,
      current: int.tryParse('${json['current']}') ?? 0,
    );
  }
}
