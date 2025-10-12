import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutterproject/API/ApiConfig.dart';
import 'package:flutterproject/DTO/noticeDTOEx.dart';

/// 공지사항 API 서비스 클래스
///
/// Backend REST API:
/// - GET /api/notices - 목록 조회
/// - GET /api/notices/{id} - 상세 조회
/// - GET /api/notices/categories - 카테고리 목록
/// - POST /api/notices - 작성 (관리자)
/// - PUT /api/notices/{id} - 수정 (관리자/작성자)
/// - DELETE /api/notices/{id} - 삭제 (관리자/작성자)
class NoticeAPI {
  final Dio _dio;
  String? _rawToken; // Bearer 접두사 없이 순수 JWT 토큰만 저장

  NoticeAPI()
      : _dio = Dio(BaseOptions(
          baseUrl: Apiconfig.baseUrl,
          headers: {'Content-Type': 'application/json; charset=UTF-8'},
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
        )) {
    // 매 요청 전에 최신 토큰을 Authorization 헤더에 추가
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final auth = _authorizationHeader;
        if (auth != null) {
          options.headers['Authorization'] = auth;
        } else {
          options.headers.remove('Authorization');
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) {
        // 에러 로깅 (개발 환경)
        print('❌ NoticeAPI Error: ${e.message}');
        if (e.response != null) {
          print('❌ Response Status: ${e.response?.statusCode}');
          print('❌ Response Data: ${e.response?.data}');
        }
        return handler.next(e);
      },
    ));
  }

  // ==================== 토큰 관리 ====================

  /// 토큰 설정 (Authorization: Bearer 접두사 제거 후 저장)
  void setToken(String? tokenLike) {
    if (tokenLike == null || tokenLike.trim().isEmpty) {
      _rawToken = null;
      return;
    }
    // "Authorization:" 또는 "Bearer " 접두사 제거
    final cleaned = tokenLike
        .trim()
        .replaceFirst(RegExp(r'^(Authorization:\s*)?Bearer\s+', caseSensitive: false), '');
    _rawToken = cleaned.isEmpty ? null : cleaned;
  }

  /// Authorization 헤더 값 반환 (Bearer {token})
  String? get _authorizationHeader => _rawToken == null ? null : 'Bearer $_rawToken';

  /// 토큰 초기화
  void clearToken() {
    _rawToken = null;
  }

  // ==================== 공지사항 목록 조회 ====================

  /// 공지사항 목록 조회 (페이지네이션)
  ///
  /// [page] 페이지 번호 (0부터 시작)
  /// [size] 페이지 크기 (기본 10)
  /// [category] 카테고리 필터 (null이면 전체)
  /// [keyword] 검색 키워드 (null이면 전체)
  Future<NoticePageResponse> getNotices({
    int page = 0,
    int size = 10,
    NoticeCategory? category,
    String? keyword,
  }) async {
    try {
      final queryParameters = <String, dynamic>{
        'page': page,
        'size': size,
      };

      // 카테고리 필터 (ALL 제외)
      if (category != null && category != NoticeCategory.all) {
        queryParameters['category'] = category.value;
      }

      // 검색 키워드
      if (keyword != null && keyword.isNotEmpty) {
        queryParameters['keyword'] = keyword;
      }

      final response = await _dio.get(
        '/api/notices',
        queryParameters: queryParameters,
      );

      if (response.statusCode == 200) {
        return NoticePageResponse.fromJson(response.data as Map<String, dynamic>);
      } else {
        throw Exception('공지사항 목록 조회 실패: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw _handleDioError(e, '공지사항 목록 조회');
    }
  }

  // ==================== 공지사항 상세 조회 ====================

  /// 공지사항 상세 조회
  ///
  /// [noticeId] 공지사항 ID
  Future<Notice> getNoticeDetail(int noticeId) async {
    try {
      final response = await _dio.get('/api/notices/$noticeId');

      if (response.statusCode == 200) {
        return Notice.fromJson(response.data as Map<String, dynamic>);
      } else {
        throw Exception('공지사항 상세 조회 실패: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw _handleDioError(e, '공지사항 상세 조회');
    }
  }

  // ==================== 카테고리 목록 조회 ====================

  /// 카테고리 목록 조회
  Future<List<Map<String, String>>> getCategories() async {
    try {
      final response = await _dio.get('/api/notices/categories');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List<dynamic>;
        return data.map((item) => Map<String, String>.from(item as Map)).toList();
      } else {
        throw Exception('카테고리 목록 조회 실패: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw _handleDioError(e, '카테고리 목록 조회');
    }
  }

  // ==================== 공지사항 작성 ====================

  /// 공지사항 작성 (관리자 전용)
  ///
  /// [request] 작성 요청 데이터
  Future<Notice> createNotice(CreateNoticeRequest request) async {
    try {
      final response = await _dio.post(
        '/api/notices',
        data: request.toJson(),
      );

      if (response.statusCode == 200) {
        return Notice.fromJson(response.data as Map<String, dynamic>);
      } else {
        throw Exception('공지사항 작성 실패: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw _handleDioError(e, '공지사항 작성');
    }
  }

  // ==================== 공지사항 수정 ====================

  /// 공지사항 수정 (관리자/작성자 전용)
  ///
  /// [noticeId] 공지사항 ID
  /// [request] 수정 요청 데이터
  Future<Notice> updateNotice(int noticeId, UpdateNoticeRequest request) async {
    try {
      final response = await _dio.put(
        '/api/notices/$noticeId',
        data: request.toJson(),
      );

      if (response.statusCode == 200) {
        return Notice.fromJson(response.data as Map<String, dynamic>);
      } else {
        throw Exception('공지사항 수정 실패: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw _handleDioError(e, '공지사항 수정');
    }
  }

  // ==================== 공지사항 삭제 ====================

  /// 공지사항 삭제 (관리자/작성자 전용)
  ///
  /// [noticeId] 공지사항 ID
  Future<void> deleteNotice(int noticeId) async {
    try {
      final response = await _dio.delete('/api/notices/$noticeId');

      if (response.statusCode != 200) {
        throw Exception('공지사항 삭제 실패: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw _handleDioError(e, '공지사항 삭제');
    }
  }

  // ==================== 에러 처리 ====================

  /// Dio 에러 처리
  Exception _handleDioError(DioException e, String operation) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return Exception('$operation 시간 초과: 네트워크 연결을 확인해주세요.');

      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        final message = e.response?.data?['message'] ?? e.response?.statusMessage;

        if (statusCode == 401) {
          return Exception('인증 실패: 로그인이 필요합니다.');
        } else if (statusCode == 403) {
          return Exception('권한 없음: $operation 권한이 없습니다.');
        } else if (statusCode == 404) {
          return Exception('$operation 실패: 존재하지 않는 공지사항입니다.');
        } else if (statusCode == 500) {
          return Exception('서버 오류: 잠시 후 다시 시도해주세요.');
        } else {
          return Exception('$operation 실패: $message');
        }

      case DioExceptionType.cancel:
        return Exception('$operation 취소됨');

      case DioExceptionType.unknown:
        if (e.error.toString().contains('SocketException')) {
          return Exception('네트워크 연결 오류: 인터넷 연결을 확인해주세요.');
        }
        return Exception('$operation 실패: ${e.message}');

      default:
        return Exception('$operation 실패: 알 수 없는 오류');
    }
  }
}
