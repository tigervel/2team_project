// lib/API/matching_api.dart
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutterproject/DTO/MatchingDTO.dart';
import 'package:flutterproject/DTO/PageRequestDTO.dart';
import 'package:flutterproject/DTO/PageResponseDTO.dart';


class MatchingApi {
  final Dio _dio;

  MatchingApi({String baseUrl = 'http://10.0.2.2:8080'})
      : _dio = Dio(BaseOptions(
          baseUrl: baseUrl, connectTimeout: const Duration(seconds: 5), receiveTimeout: const Duration(seconds: 10),
        ))..interceptors.add(LogInterceptor(requestBody: kDebugMode, responseBody: kDebugMode));

  Future<PageResponseDTO<MatchingDTO>> getEstimateList({
    required PageRequestDTO request,
    required String bearerToken,
  }) async {
    final res = await _dio.get(
      // 컨트롤러의 상위 @RequestMapping 경로에 맞춰 바꾸세요.
      // 예: '/api/matching/list' 또는 '/matching/list'
      '/g2i4/estimate/list',
      queryParameters: request.toQuery(),
      options: Options(headers: {'Authorization': 'Bearer $bearerToken'}),
    );

    final data = res.data as Map<String, dynamic>;
    return PageResponseDTO<MatchingDTO>.fromJson(
      data,
      (m) => MatchingDTO.fromJson(m),
    );
  }
  Future<void> acceptMatching({
    required int estimateNo,
    required String bearerToken,
  }) async{
    await _dio.post(
      '/g2i4/estimate/subpath/accepted',
      options: Options(headers: {'Authorization': 'Bearer $bearerToken'}),
      data: {'estimateNo' : estimateNo},
      );
  }

  Future<void> rejectMatching({
  required int estimateNo,
  required String bearerToken,
}) async {
  await _dio.post(
   '/g2i4/estimate/subpath/rejected',
    data: {'estimateNo': estimateNo},
    options: Options(headers: {'Authorization': 'Bearer $bearerToken'}),
  );
}
}
