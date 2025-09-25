import 'dart:io';

import 'package:flutter/foundation.dart';

class Apiconfig {
  static final String baseUrl = _detectBaseUrl();
  
  static String _detectBaseUrl() {
    const env = String.fromEnvironment('BASE_URL');
    if(env.isNotEmpty) return env;

    if(kIsWeb) return 'http://localhost:8080';
    if(Platform.isAndroid) return 'http://10.0.2.2:8080';
    return 'http://localhost:8080';
  }
}