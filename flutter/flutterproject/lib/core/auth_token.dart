import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';

const List<String> _tokenPreferenceKeys = [
  'token',
  'accessToken',
  'ACCESS_TOKEN',
  'access_token',
];

String? _normalizeToken(String? token) {
  final raw = token?.trim();
  if (raw == null || raw.isEmpty) return null;
  if (raw.length > 7 && raw.substring(0, 7).toLowerCase() == 'bearer ') {
    return raw.substring(7).trimLeft();
  }
  return raw;
}

bool _isExpired(String token) {
  try {
    return JwtDecoder.isExpired(token);
  } catch (_) {
    return true;
  }
}

Future<String> loadAccessToken() async {
  final prefs = await SharedPreferences.getInstance();
  for (final key in _tokenPreferenceKeys) {
    final stored = prefs.getString(key);
    final normalized = _normalizeToken(stored);
    if (normalized == null) continue;
    if (_isExpired(normalized)) {
      await prefs.remove(key);
      continue;
    }
    return normalized;
  }
  return '';
}
