import 'package:dio/dio.dart';
import 'package:flutterproject/API/ApiConfig.dart';

class DirectionsResult {
  final double distanceM;              // 미터 단위
  final List<List<dynamic>> path;      // [[lng, lat], ...] 형태

  DirectionsResult({required this.distanceM, required this.path});

  factory DirectionsResult.fromJson(Map<String, dynamic> json) {
    return DirectionsResult(
      distanceM: (json['distance'] as num).toDouble(),
      path: (json['path'] as List).map<List<dynamic>>((e) => (e as List).toList()).toList(),
    );
  }
}

class MapApi {
  final Dio _dio;

  MapApi({String? bearerToken})
      : _dio = Dio(BaseOptions(
          baseUrl: Apiconfig.baseUrl,
          headers: {'Content-Type': 'application/json'},
        )) {
    if (bearerToken != null && bearerToken.isNotEmpty) {
      _dio.options.headers['Authorization'] = 'Bearer $bearerToken';
    }
  }

  void setBearerToken(String? token) {
    if (token == null || token.isEmpty) {
      _dio.options.headers.remove('Authorization');
    } else {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    }
  }

  Future<DirectionsResult> getDirections({
    required String startAddress,
    required String endAddress,
  }) async {
    final res = await _dio.get(
      '/api/map/directions', // 서버 경로에 맞게 조정
      queryParameters: {
        'startAddress': startAddress,
        'endAddress': endAddress,
      },
    );
    return DirectionsResult.fromJson(res.data as Map<String, dynamic>);
  }
}
