import 'package:flutter/material.dart';

class UserProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;

  Map<String, dynamic>? get user => _user;

  // The user's role, e.g., 'ROLE_DRIVER' or 'ROLE_SHIPPER'
  String? get role {
    if (_user == null) return null;

    final data = Map<String, dynamic>.from(_user!);

    String? pick(Map<String, dynamic>? x) {
      if (x == null) return null;
      return (x['userType'] ?? x['type'] ?? x['role'] ?? x['loginType']) as String?;
    }

    final nestedData = (data['data'] is Map) ? Map<String, dynamic>.from(data['data']) : null;
    final t = pick(data) ?? pick(nestedData) ?? 'MEMBER';

    return (t == 'CARGO_OWNER') ? 'CARGO_OWNER' : 'MEMBER';
  }

  void setUser(Map<String, dynamic> user) {
    _user = user;
    notifyListeners();
  }

  void clearUser() {
    _user = null;
    notifyListeners();
  }
}
