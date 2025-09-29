import 'package:dio/dio.dart';
import 'package:flutterproject/API/ApiConfig.dart';


// 리액트의 extraCharge 목록 대응용 간단 모델
class ExtraFee {
  final String title;
  final int amount;
  ExtraFee({required this.title, required this.amount});

  factory ExtraFee.fromJson(Map<String, dynamic> json) => ExtraFee(
        title: json['extraChargeTitle']?.toString() ?? '',
        amount: int.tryParse('${json['extraCharge']}') ?? 0,
      );
}

class EstimateApi {
  final Dio _dio;
  String bearerToken;
  EstimateApi({required this.bearerToken})
      : _dio = Dio(BaseOptions(
          baseUrl: Apiconfig.baseUrl,
          headers: {'Content-Type': 'application/json'},
        )) {
    if (bearerToken != null && bearerToken.isNotEmpty) {
      _dio.options.headers['Authorization'] = 'Bearer $bearerToken';
    }
  }

  /// 토큰을 나중에 교체해야 할 때
  void setBearerToken(String? token) {
    if (token != null && token.isNotEmpty) {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    } else {
      _dio.options.headers.remove('Authorization');
    }
  }


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
    await _dio.post('/g2i4/estimate/',
     data: payload
     ,options: Options(headers: {'Authorization': 'Bearer $bearerToken'}) ); // TODO: 서버 경로 맞추기
  }
}
