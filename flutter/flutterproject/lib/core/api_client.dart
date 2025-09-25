import 'package:dio/dio.dart';

import 'auth_token.dart';

class ApiClient {
  final Dio dio;
  ApiClient._(this.dio);

  static Future<ApiClient> create({required String baseUrl}) async {
    final dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 20),
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await loadAccessToken();
          if (token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          } else {
            options.headers.remove('Authorization');
          }
          handler.next(options);
        },
      ),
    );

    return ApiClient._(dio);
  }
}
