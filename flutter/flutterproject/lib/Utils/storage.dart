import 'package:shared_preferences/shared_preferences.dart';

class Storage {
  static Future<void> saveToken(String token) async {
    final sp = await SharedPreferences.getInstance();
    await sp.setString('token', token);
  }

  static Future<String?> getToken() async {
    final sp = await SharedPreferences.getInstance();
    return sp.getString('token');
  }

  static Future<void> saveRefreshToken(String token) async {
    final sp = await SharedPreferences.getInstance();
    await sp.setString('refreshToken', token);
  }

  static Future<String?> getRefreshToken() async {
    final sp = await SharedPreferences.getInstance();
    return sp.getString('refreshToken');
  }

  static Future<void> removeToken() async {
    final sp = await SharedPreferences.getInstance();
    await sp.remove('token');
    await sp.remove('refreshToken');
  }
}
