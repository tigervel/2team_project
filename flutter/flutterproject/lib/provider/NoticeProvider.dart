import 'package:flutter/material.dart';
import 'package:flutterproject/DTO/noticeDTOEx.dart';
import 'package:flutterproject/API/NoticeAPI.dart';

/// 공지사항 상태 관리 Provider
///
/// 기능:
/// - 공지사항 목록 조회 (페이지네이션)
/// - 카테고리 필터링
/// - 공지사항 상세 조회
/// - 공지사항 작성/수정/삭제
/// - 로딩/에러 상태 관리
class NoticeProvider extends ChangeNotifier {
  // ==================== API 클라이언트 ====================

  final NoticeAPI _api = NoticeAPI();

  /// JWT 토큰 설정 (TokenProvider에서 가져온 토큰)
  void setToken(String? token) {
    _api.setToken(token);
  }

  /// 토큰 초기화
  void clearToken() {
    _api.clearToken();
  }

  // ==================== 상태 변수 ====================

  /// 공지사항 목록
  List<Notice> _notices = [];
  List<Notice> get notices => _notices;

  /// 현재 선택된 공지사항 (상세보기용)
  Notice? _selectedNotice;
  Notice? get selectedNotice => _selectedNotice;

  /// 페이지네이션 정보
  int _currentPage = 0;
  int get currentPage => _currentPage;

  int _totalPages = 0;
  int get totalPages => _totalPages;

  int _totalElements = 0;
  int get totalElements => _totalElements;

  bool _hasNext = false;
  bool get hasNext => _hasNext;

  bool _hasPrevious = false;
  bool get hasPrevious => _hasPrevious;

  /// 페이지 크기
  int _pageSize = 10;
  int get pageSize => _pageSize;

  /// 활성 카테고리 필터
  NoticeCategory _activeCategory = NoticeCategory.all;
  NoticeCategory get activeCategory => _activeCategory;

  /// 검색 키워드
  String? _keyword;
  String? get keyword => _keyword;

  /// 로딩 상태
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  /// 에러 메시지
  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  // ==================== 카테고리 필터링 ====================

  /// 카테고리 변경
  void setCategory(NoticeCategory category) {
    if (_activeCategory != category) {
      _activeCategory = category;
      _currentPage = 0; // 페이지 리셋
      notifyListeners();
      // 목록 재조회는 UI에서 호출
    }
  }

  /// 카테고리 초기화
  void resetCategory() {
    _activeCategory = NoticeCategory.all;
    _currentPage = 0;
    notifyListeners();
  }

  // ==================== 검색 ====================

  /// 검색 키워드 설정
  void setKeyword(String? keyword) {
    _keyword = keyword;
    _currentPage = 0; // 페이지 리셋
    notifyListeners();
  }

  /// 검색 초기화
  void clearKeyword() {
    _keyword = null;
    _currentPage = 0;
    notifyListeners();
  }

  // ==================== 페이지네이션 ====================

  /// 페이지 변경
  void setPage(int page) {
    if (page >= 0 && page < _totalPages) {
      _currentPage = page;
      notifyListeners();
    }
  }

  /// 다음 페이지
  void nextPage() {
    if (_hasNext) {
      _currentPage++;
      notifyListeners();
    }
  }

  /// 이전 페이지
  void previousPage() {
    if (_hasPrevious) {
      _currentPage--;
      notifyListeners();
    }
  }

  /// 첫 페이지로 이동
  void resetPage() {
    _currentPage = 0;
    notifyListeners();
  }

  // ==================== 공지사항 목록 조회 ====================

  /// 공지사항 목록 조회
  ///
  /// [page] 페이지 번호 (0부터 시작)
  /// [size] 페이지 크기
  /// [category] 카테고리 필터 (null이면 전체)
  /// [keyword] 검색 키워드
  Future<void> fetchNotices({
    int? page,
    int? size,
    NoticeCategory? category,
    String? keyword,
  }) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();
      print('호출됨');
      // API 호출
      final response = await _api.getNotices(
        page: page ?? _currentPage,
        size: size ?? _pageSize,
        category: category ?? (_activeCategory == NoticeCategory.all ? null : _activeCategory),
        keyword: keyword ?? _keyword,
      );
      // 상태 업데이트
      _notices = response.content;
      _currentPage = response.currentPage;
      _totalPages = response.totalPages;
      _totalElements = response.totalElements;
      _hasNext = response.hasNext;
      _hasPrevious = response.hasPrevious;

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = '공지사항 목록을 불러오는데 실패했습니다: ${e.toString()}';
      notifyListeners();
      rethrow;
    }
  }

  /// 공지사항 목록 새로고침 (Pull to Refresh용)
  Future<void> refreshNotices() async {
    _currentPage = 0;
    await fetchNotices(
      page: _currentPage,
      size: _pageSize,
      category: _activeCategory == NoticeCategory.all ? null : _activeCategory,
      keyword: _keyword,
    );
  }

  // ==================== 공지사항 상세 조회 ====================

  /// 공지사항 상세 조회
  ///
  /// [noticeId] 공지사항 ID
  Future<Notice?> fetchNoticeDetail(int noticeId) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      // API 호출
      final notice = await _api.getNoticeDetail(noticeId);
      _selectedNotice = notice;

      _isLoading = false;
      notifyListeners();
      return _selectedNotice;
    } catch (e) {
      _isLoading = false;
      _errorMessage = '공지사항을 불러오는데 실패했습니다: ${e.toString()}';
      notifyListeners();
      rethrow;
    }
  }

  /// 선택된 공지사항 설정
  void setSelectedNotice(Notice? notice) {
    _selectedNotice = notice;
    notifyListeners();
  }

  /// 선택된 공지사항 초기화
  void clearSelectedNotice() {
    _selectedNotice = null;
    notifyListeners();
  }

  // ==================== 공지사항 작성 ====================

  /// 공지사항 작성
  ///
  /// [request] 작성 요청 데이터
  Future<Notice?> createNotice(CreateNoticeRequest request) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      // API 호출
      final notice = await _api.createNotice(request);

      _isLoading = false;
      notifyListeners();

      // 목록 새로고침
      await refreshNotices();

      return notice;
    } catch (e) {
      _isLoading = false;
      _errorMessage = '공지사항 작성에 실패했습니다: ${e.toString()}';
      notifyListeners();
      rethrow;
    }
  }

  // ==================== 공지사항 수정 ====================

  /// 공지사항 수정
  ///
  /// [noticeId] 공지사항 ID
  /// [request] 수정 요청 데이터
  Future<Notice?> updateNotice(int noticeId, UpdateNoticeRequest request) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      // API 호출
      final notice = await _api.updateNotice(noticeId, request);

      _isLoading = false;
      notifyListeners();

      // 목록 새로고침
      await refreshNotices();

      return notice;
    } catch (e) {
      _isLoading = false;
      _errorMessage = '공지사항 수정에 실패했습니다: ${e.toString()}';
      notifyListeners();
      rethrow;
    }
  }

  // ==================== 공지사항 삭제 ====================

  /// 공지사항 삭제
  ///
  /// [noticeId] 공지사항 ID
  Future<void> deleteNotice(int noticeId) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      // API 호출
      await _api.deleteNotice(noticeId);

      _isLoading = false;
      notifyListeners();

      // 목록 새로고침
      await refreshNotices();
    } catch (e) {
      _isLoading = false;
      _errorMessage = '공지사항 삭제에 실패했습니다: ${e.toString()}';
      notifyListeners();
      rethrow;
    }
  }

  // ==================== 카테고리 목록 조회 ====================

  /// 카테고리 목록 조회
  Future<List<NoticeCategory>> fetchCategories() async {
    try {
      // API 호출 (Phase 3에서 구현)
      // 현재는 Enum 값 반환
      return NoticeCategory.values;
    } catch (e) {
      _errorMessage = '카테고리 목록을 불러오는데 실패했습니다: ${e.toString()}';
      notifyListeners();
      rethrow;
    }
  }

  // ==================== 상태 초기화 ====================

  /// 에러 메시지 초기화
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// 전체 상태 초기화
  void reset() {
    _notices = [];
    _selectedNotice = null;
    _currentPage = 0;
    _totalPages = 0;
    _totalElements = 0;
    _hasNext = false;
    _hasPrevious = false;
    _activeCategory = NoticeCategory.all;
    _keyword = null;
    _isLoading = false;
    _errorMessage = null;
    notifyListeners();
  }

  // ==================== 유틸리티 ====================

  /// 공지사항 목록이 비어있는지 확인
  bool get isEmpty => _notices.isEmpty;

  /// 공지사항 목록이 있는지 확인
  bool get isNotEmpty => _notices.isNotEmpty;

  /// 첫 페이지인지 확인
  bool get isFirstPage => _currentPage == 0;

  /// 마지막 페이지인지 확인
  bool get isLastPage => _currentPage >= _totalPages - 1;
}
