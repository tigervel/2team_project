import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/auth_token.dart';

// =================== 공통 상수/유틸 ===================
const String kApiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'http://10.0.2.2:8080', // 에뮬레이터 기본
);

const String kDefaultAvatar =
    'assets/images/avatar_placeholder.png'; // 프로젝트 내 플레이스홀더(없으면 네트워크 이미지로 대체)

String? _getFirst(List<dynamic> candidates) {
  for (final v in candidates) {
    if (v != null && v is String && v.isNotEmpty) return v;
  }
  return null;
}

String? normalizeProfileUrl(String? v) {
  if (v == null || v.isEmpty) return null;
  if (v.startsWith('http')) return v;
  if (v.startsWith('/g2i4/uploads/')) return '$kApiBase$v';
  return '$kApiBase/g2i4/uploads/user_profile/${Uri.encodeComponent(v)}';
}

// =================== 페이지 ===================
class EditMyInformPage extends StatefulWidget {
  const EditMyInformPage({super.key});

  @override
  State<EditMyInformPage> createState() => _EditMyInformPageState();
}

class _EditMyInformPageState extends State<EditMyInformPage> {
  late final Dio dio;

  bool loading = true;
  bool uploading = false;

  String? userType; // 'MEMBER' | 'CARGO_OWNER'

  // 공통 스키마
  String id = '';
  String name = '';
  String email = '';
  String phone = '';
  String address = '';
  String postcode = '';
  String createdDate = '';

  // 비밀번호
  final _pwdCurrentCtrl = TextEditingController();
  final _pwdNextCtrl = TextEditingController();
  final _pwdConfirmCtrl = TextEditingController();
  bool showPwdCurrent = false;
  bool showPwdNext = false;
  bool showPwdConfirm = false;

  // 아바타
  String? avatarUrl;

  @override
  void initState() {
    super.initState();
    dio = Dio(BaseOptions(baseUrl: kApiBase));
    _attachAuthInterceptor();
    _loadUser();
  }

  void _attachAuthInterceptor() {
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await loadAccessToken();
        if (token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));
  }

  Future<void> _loadUser() async {
    setState(() => loading = true);
    try {
      final res = await dio.get('/g2i4/user/info');
      final raw = res.data ?? {};
      final t =
          raw['userType'] ?? raw['type'] ?? raw['role'] ?? raw['loginType'];
      final data = raw['data'] ??
          raw['user'] ??
          raw['payload'] ??
          raw['profile'] ??
          raw['account'] ??
          raw['result'] ??
          {};

      if (t != 'MEMBER' && t != 'CARGO_OWNER') {
        throw Exception('Unexpected userType');
      }

      if (t == 'MEMBER') {
        id = _getFirst([
              data['mem_id'],
              data['memberId'],
              data['id'],
              data['username']
            ]) ??
            '';
        name =
            _getFirst([data['mem_name'], data['memberName'], data['name']]) ??
                '';
        email = _getFirst(
                [data['mem_email'], data['memberEmail'], data['email']]) ??
            '';
        phone = _getFirst(
                [data['mem_phone'], data['memberPhone'], data['phone']]) ??
            '';
        address = _getFirst([
              data['mem_address'],
              data['memberAddress'],
              data['address']
            ]) ??
            '';
        createdDate = _getFirst([
              data['mem_create_id_date_time'],
              data['memCreatedDateTime'],
              data['created_at'],
              data['createdAt']
            ]) ??
            '';
      } else {
        id = _getFirst([
              data['cargo_id'],
              data['cargoId'],
              data['id'],
              data['username']
            ]) ??
            '';
        name =
            _getFirst([data['cargo_name'], data['cargoName'], data['name']]) ??
                '';
        email = _getFirst(
                [data['cargo_email'], data['cargoEmail'], data['email']]) ??
            '';
        phone = _getFirst(
                [data['cargo_phone'], data['cargoPhone'], data['phone']]) ??
            '';
        address = _getFirst([
              data['cargo_address'],
              data['cargoAddress'],
              data['address']
            ]) ??
            '';
        createdDate = _getFirst([
              data['cargo_created_date_time'],
              data['cargo_created_datetime'],
              data['cargoCreateidDateTime'],
              data['created_at'],
              data['createdAt']
            ]) ??
            '';
      }

      final avatarName = _getFirst([
        data['webPath'],
        data['profileImage'],
        data['mem_profile_image'],
        data['cargo_profile_image'],
        data['profile'],
      ]);
      avatarUrl = normalizeProfileUrl(avatarName);

      setState(() {
        userType = t;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('회원 정보를 불러오지 못했습니다: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  // 주소 찾기: Flutter에선 Daum JS를 직접 못 불러오므로
  // 간단 입력 다이얼로그로 대체 (원하면 WebView 연동 가능)
  Future<void> _openPostcodeDialog() async {
    final addrCtrl = TextEditingController(text: address);
    final postCtrl = TextEditingController(text: postcode);

    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('주소 입력'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
                controller: addrCtrl,
                decoration: const InputDecoration(labelText: '주소')),
            const SizedBox(height: 12),
            TextField(
                controller: postCtrl,
                decoration: const InputDecoration(labelText: '우편번호')),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('확인'),
          ),
        ],
      ),
    );

    if (ok == true) {
      setState(() {
        address = addrCtrl.text;
        postcode = postCtrl.text;
      });
    }
  }

  Future<void> _saveAddress() async {
    try {
      if (userType == null || id.isEmpty) return;
      final url = (userType == 'MEMBER')
          ? '/g2i4/member/${Uri.encodeComponent(id)}/address'
          : '/g2i4/cargo/${Uri.encodeComponent(id)}/address';
      await dio.put(url, data: {
        'address': address,
        'postcode': postcode.isEmpty ? null : postcode
      });
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('주소가 변경되었습니다.')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('주소 변경 실패: $e')));
      }
    }
  }

  Future<void> _changePassword() async {
    try {
      if (userType == null || id.isEmpty) return;
      if (_pwdCurrentCtrl.text.isEmpty ||
          _pwdNextCtrl.text.isEmpty ||
          _pwdConfirmCtrl.text.isEmpty) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('비밀번호를 모두 입력하세요.')));
        return;
      }
      if (_pwdNextCtrl.text != _pwdConfirmCtrl.text) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('새 비밀번호가 일치하지 않습니다.')));
        return;
      }
      final url = (userType == 'MEMBER')
          ? '/g2i4/member/${Uri.encodeComponent(id)}/password'
          : '/g2i4/cargo/${Uri.encodeComponent(id)}/password';
      await dio.put(url, data: {
        'currentPassword': _pwdCurrentCtrl.text,
        'newPassword': _pwdNextCtrl.text
      });
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('비밀번호가 변경되었습니다.')));
      }
      _pwdCurrentCtrl.clear();
      _pwdNextCtrl.clear();
      _pwdConfirmCtrl.clear();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('비밀번호 변경 실패: $e')));
      }
    }
  }

  Future<void> _uploadAvatar() async {
    try {
      final picker = ImagePicker();
      final picked =
          await picker.pickImage(source: ImageSource.gallery, imageQuality: 92);
      if (picked == null) return;

      final file = File(picked.path);
      final len = await file.length();
      if (len > 5 * 1024 * 1024) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('파일 크기는 5MB를 넘을 수 없습니다.')));
        return;
      }

      if (userType == null || id.isEmpty) return;

      setState(() => uploading = true);

      final form = FormData.fromMap({
        'image': await MultipartFile.fromFile(file.path, filename: picked.name),
        'userType': userType,
        'id': id,
      });

      final res = await dio.post('/g2i4/user/upload-image', data: form);
      final data = res.data;
      final url = normalizeProfileUrl(data?['webPath'] ?? data?['filename']);

      if (url != null) {
        setState(() {
          avatarUrl =
              '$url?v=${DateTime.now().millisecondsSinceEpoch}'; // 캐시 버스트
        });
      }
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('프로필 이미지가 업로드되었습니다.')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('업로드 실패: $e')));
      }
    } finally {
      if (mounted) setState(() => uploading = false);
    }
  }

  Future<void> _deleteAvatar() async {
    try {
      final ok = await showDialog<bool>(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('삭제 확인'),
          content: const Text('프로필 이미지를 삭제할까요?'),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('취소')),
            ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('삭제')),
          ],
        ),
      );
      if (ok != true) return;

      setState(() => uploading = true);
      await dio.delete('/g2i4/user/profile-image');
      setState(() => avatarUrl = null);

      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('프로필 이미지가 삭제되었습니다.')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('삭제 실패: $e')));
      }
    } finally {
      if (mounted) setState(() => uploading = false);
    }
  }

  @override
  void dispose() {
    _pwdCurrentCtrl.dispose();
    _pwdNextCtrl.dispose();
    _pwdConfirmCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        title: const Text('회원 정보 수정'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('로그인 유형: ${userType == 'MEMBER' ? '일반 회원' : '화물(차량) 소유자'}',
                style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),

            // Profile Section
            Card(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final isWide = constraints.maxWidth >= 720;

                    final avatarSection = Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: Colors.grey.shade200,
                          backgroundImage: (avatarUrl != null)
                              ? NetworkImage(avatarUrl!)
                              : (kDefaultAvatar.isNotEmpty
                                  ? AssetImage(kDefaultAvatar) as ImageProvider
                                  : null),
                        ),
                        const SizedBox(width: 16, height: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ElevatedButton(
                              onPressed: uploading ? null : _uploadAvatar,
                              style: ElevatedButton.styleFrom(
                                  minimumSize: const Size(160, 40)),
                              child: Text(uploading ? '업로드 중...' : '사진 업로드'),
                            ),
                            const SizedBox(height: 8),
                            TextButton(
                              onPressed: uploading ? null : _deleteAvatar,
                              style: TextButton.styleFrom(
                                  foregroundColor: Colors.red),
                              child: const Text('���� ����'),
                            ),
                          ],
                        ),
                      ],
                    );

                    final infoSection = Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('회원 정보',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text('이름 : $name'),
                        const SizedBox(height: 6),
                        Text('아이디 : $id'),
                        const SizedBox(height: 6),
                        Text('이메일 : $email'),
                      ],
                    );

                    if (isWide) {
                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Expanded(child: avatarSection),
                          const SizedBox(width: 32),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.only(left: 16),
                              child: infoSection,
                            ),
                          ),
                        ],
                      );
                    }

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        avatarSection,
                        const SizedBox(height: 16),
                        infoSection,
                      ],
                    );
                  },
                ),
              ),
            ),

            const SizedBox(height: 24),

            // 주소 변경
            const Text('회원 정보', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: TextEditingController(text: address),
                    readOnly: true,
                    onTap: _openPostcodeDialog,
                    decoration: InputDecoration(
                      labelText: '주소',
                      filled: true,
                      fillColor: const Color(0xFFF3F4F6),
                      border: const OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  width: 140,
                  height: 48,
                  child: OutlinedButton(
                    onPressed: _openPostcodeDialog,
                    child: const Text('주소 찾기'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: SizedBox(
                width: 160,
                height: 48,
                child: ElevatedButton(
                  onPressed: _saveAddress,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6B46C1),
                  ),
                  child: const Text('변경하기'),
                ),
              ),
            ),

            const SizedBox(height: 24),
            const Divider(),
            const SizedBox(height: 24),

            // 비밀번호 변경
            const Text('회원 정보', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),

            _PasswordField(
              label: '현재 비밀번호',
              controller: _pwdCurrentCtrl,
              visible: showPwdCurrent,
              onToggle: () => setState(() => showPwdCurrent = !showPwdCurrent),
            ),
            const SizedBox(height: 12),
            _PasswordField(
              label: '새로운 비밀번호',
              controller: _pwdNextCtrl,
              visible: showPwdNext,
              onToggle: () => setState(() => showPwdNext = !showPwdNext),
            ),
            const SizedBox(height: 12),
            _PasswordField(
              label: '새로운 비밀번호 확인',
              controller: _pwdConfirmCtrl,
              visible: showPwdConfirm,
              onToggle: () => setState(() => showPwdConfirm = !showPwdConfirm),
            ),
            const SizedBox(height: 12),

            Align(
              alignment: Alignment.centerRight,
              child: SizedBox(
                width: 160,
                height: 48,
                child: ElevatedButton(
                  onPressed: _changePassword,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6B46C1),
                  ),
                  child: const Text('변경하기'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// =================== 위젯 ===================
class _PasswordField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final bool visible;
  final VoidCallback onToggle;

  const _PasswordField({
    required this.label,
    required this.controller,
    required this.visible,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: !visible,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: const Color(0xFFF3F4F6),
        border: const OutlineInputBorder(),
        suffixIcon: IconButton(
          onPressed: onToggle,
          icon: Icon(visible ? Icons.visibility : Icons.visibility_off),
        ),
      ),
    );
  }
}
