import 'package:dio/dio.dart';
import 'package:flutterproject/API/ApiConfig.dart';

class EstimateApi {
  final Dio _dio;
  String? _rawToken; // ✅ "Bearer " 없이 순수 JWT만 저장

  EstimateApi()
      : _dio = Dio(BaseOptions(
          baseUrl: Apiconfig.baseUrl,
          headers: {'Content-Type': 'application/json'},
        )) {
    // 매 요청 전에 최신 토큰을 Authorization에 주입
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
    ));
  }

  /// 토큰 입력 시 "Authorization:"/ "Bearer " 접두사를 제거하고 순수 토큰만 보관
  void setToken(String? tokenLike) {
    if (tokenLike == null || tokenLike.trim().isEmpty) {
      _rawToken = null;
      return;
    }
    final cleaned = tokenLike
        .trim()
        .replaceFirst(RegExp(r'^(Authorization:\s*)?Bearer\s+', caseSensitive: false), '');
    _rawToken = cleaned.isEmpty ? null : cleaned;
  }

  String? get _authorizationHeader =>
      _rawToken == null ? null : 'Bearer $_rawToken';

  // --- 거리/경로 ---
  Future<({double distanceM, List<List> path})> getDirections({
    required String startAddress,
    required String endAddress,
  }) async {
    final res = await _dio.get(
      '/api/map/directions', // TODO: 서버 경로 맞추기
      queryParameters: {'startAddress': startAddress, 'endAddress': endAddress},
    );
    final data = res.data as Map<String, dynamic>;
    final distance = (data['distance'] as num).toDouble(); // meters
    final path = (data['path'] as List).cast<List>();
    return (distanceM: distance, path: path);
  }

  // --- 견적 제출 ---
  Future<void> submitEstimate(Map<String, dynamic> payload) async {
    await _dio.post(
      '/g2i4/estimate/', // TODO: 서버 경로 맞추기
      data: payload,
    );
  }
}
