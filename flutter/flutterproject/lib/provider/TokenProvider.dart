import 'package:flutter/material.dart';
import 'package:flutterproject/utils/storage.dart';

class Tokenprovider extends ChangeNotifier{
  String? _token;
  String? get gettoken => _token;

  Future<void> loadToken() async{
    _token = await Storage.getToken();
    notifyListeners();
  }

  Future<void> setToken(String token) async{
     final raw = token.trim().replaceFirst(RegExp(r'^(Authorization:\s*)?Bearer\s+', caseSensitive: false), '');
    _token = raw;
    await Storage.saveToken(raw);
    notifyListeners();
  }

  Future<void> clearToken() async{
    _token = null;
    await Storage.removeToken();
    notifyListeners();
  }
}