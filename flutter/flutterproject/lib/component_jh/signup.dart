import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutterproject/Utils/storage.dart';
import 'package:flutterproject/component_jh/login.dart';
import 'package:flutterproject/services/auth_service.dart';
import 'package:kpostal/kpostal.dart';

class SignUpPage extends StatefulWidget {
  final String? socialEmail; // 소셜 로그인 이메일
  final String? socialName; // 소셜 로그인 이름
  final bool isSocial; // 소셜 회원가입 여부
  final String? signupTicket; // 소셜 로그인 티켓 추가

  SignUpPage({
    super.key,
    this.socialEmail,
    this.socialName,
    this.isSocial = false,
    this.signupTicket,
  });

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final _formKey = GlobalKey<FormState>();
  final AuthService authService = AuthService();

  // Controllers
  final _idController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  late TextEditingController _emailController;
  late TextEditingController _nameController;
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _detailAddressController = TextEditingController();
  final _carNumberController = TextEditingController();
  final _codeController = TextEditingController();

  // FocusNodes
  final _idFocus = FocusNode();
  final _passwordFocus = FocusNode();
  final _confirmFocus = FocusNode();
  final _emailFocus = FocusNode();

  // 사용자 유형
  String userType = "화주";

  // Password visibility
  bool showPassword = false;
  bool showConfirmPassword = false;

  // 실시간 오류 메시지
  String? _idError;
  String? _passwordError;
  String? _confirmError;
  String? _emailError;

  // 이메일 인증 상태
  bool codeSent = false;
  bool verified = false;
  bool verifying = false;

  @override
  void initState() {
    super.initState();

    _emailController = TextEditingController(
      text: widget.isSocial ? widget.socialEmail ?? "" : "",
    );
    _nameController = TextEditingController(
      text: widget.isSocial ? widget.socialName ?? "" : "",
    );

    if (widget.isSocial && widget.socialEmail != null) {
      verified = true; // 소셜 로그인 시 이메일 인증 자동 완료
    }

    // FocusListeners 초기화
    _idFocus.addListener(() {
      if (!_idFocus.hasFocus) setState(() => _idError = null);
    });
    _passwordFocus.addListener(() {
      if (!_passwordFocus.hasFocus) setState(() => _passwordError = null);
    });
    _confirmFocus.addListener(() {
      if (!_confirmFocus.hasFocus) setState(() => _confirmError = null);
    });
    _emailFocus.addListener(() {
      if (!_emailFocus.hasFocus) setState(() => _emailError = null);
    });
  }

  @override
  void dispose() {
    _idController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _emailController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _detailAddressController.dispose();
    _carNumberController.dispose();
    _codeController.dispose();
    _idFocus.dispose();
    _passwordFocus.dispose();
    _confirmFocus.dispose();
    _emailFocus.dispose();
    super.dispose();
  }

  // 정규식 검증
  bool _isValidId(String id) => RegExp(r'^[a-zA-Z0-9]{4,12}$').hasMatch(id);
  bool _isValidPassword(String pw) =>
      RegExp(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$').hasMatch(pw);
  bool _isValidEmail(String email) =>
      RegExp(r'^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$').hasMatch(email);

  String? _validateRequired(String? value, String fieldName) {
    if (value == null || value.trim().isEmpty) return "$fieldName 입력은 필수입니다.";
    return null;
  }

  // 이메일 인증 발송
  Future<void> _sendEmailCode() async {
    final email = _emailController.text.trim();
    if (!_isValidEmail(email)) {
      _showDialog("이메일 형식 오류", "올바른 이메일 주소를 입력해주세요.");
      return;
    }

    try {
      await authService.sendEmailCode(email);
      setState(() => codeSent = true);
      _showDialog("인증코드 발송", "$email 로 인증코드를 발송했습니다.");
    } catch (e) {
      _showDialog("오류", e.toString());
    }
  }

  // 이메일 인증 확인
  Future<void> _verifyCode() async {
    setState(() => verifying = true);
    final email = _emailController.text.trim();
    final code = _codeController.text.trim();
    if (code.isEmpty) {
      _showDialog("오류", "코드를 입력해주세요.");
      setState(() => verifying = false);
      return;
    }

    try {
      final result = await authService.verifyEmailCode(email, code);
      if (result) {
        setState(() => verified = true);
        _showDialog("인증 완료", "이메일 인증이 완료되었습니다.");
      } else {
        _showDialog("실패", "코드가 틀렸거나 만료되었습니다.");
      }
    } catch (e) {
      _showDialog("오류", e.toString());
    } finally {
      setState(() => verifying = false);
    }
  }

  // ID 중복 확인
  Future<void> _checkIdDuplicate() async {
    final id = _idController.text.trim();
    if (!_isValidId(id)) {
      _showDialog("아이디 형식 오류", "아이디는 4~12자의 영어/숫자로 입력해야 합니다.");
      return;
    }

    try {
      final available = await authService.checkIdDuplicate(id);
      if (available) {
        _showDialog("사용 가능", "사용 가능한 아이디입니다.");
      } else {
        _showDialog("사용 불가", "이미 존재하는 아이디입니다.");
      }
    } catch (e) {
      _showDialog("오류", e.toString());
    }
  }

  // 주소 검색
  Future<void> _searchAddress() async {
    final result = await Navigator.push<Kpostal>(
      context,
      MaterialPageRoute(
        fullscreenDialog: true,
        builder: (_) => Scaffold(
          body: KpostalView(useLocalServer: true, localPort: 1024),
        ),
      ),
    );

    if (result != null) {
      setState(() {
        _addressController.text =
            "${result.address}${result.buildingName != null && result.buildingName!.isNotEmpty ? " (${result.buildingName})" : ""}";
      });
    }
  }

  // 회원가입 처리
  Future<void> _signUp() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _idError = _isValidId(_idController.text)
          ? null
          : "아이디는 4~12자의 영어/숫자여야 합니다.";
      _passwordError = _isValidPassword(_passwordController.text)
          ? null
          : "비밀번호는 최소 8자, 숫자+영문+특수문자 포함해야 합니다.";
      _confirmError =
          _confirmPasswordController.text == _passwordController.text
              ? null
              : "비밀번호가 일치하지 않습니다.";
      _emailError = _isValidEmail(_emailController.text)
          ? null
          : "올바른 이메일 형식이 아닙니다.";
    });

    if (_idError != null ||
        _passwordError != null ||
        _confirmError != null ||
        _emailError != null) return;

    if (!verified) {
      _showDialog("인증 필요", "이메일 인증을 완료해주세요.");
      return;
    }

    try {
      if (widget.isSocial) {
        await authService.completeSocialSignup(
          signupTicket: widget.signupTicket!,
          role: userType == "화주" ? "SHIPPER" : "DRIVER",
          loginId: _idController.text.trim(),
          password: _passwordController.text.trim(),
          name: _nameController.text.trim(),
          phone: _phoneController.text.trim(),
          address: _addressController.text.trim(),
          detailAddress: _detailAddressController.text.trim(),
          carNumber:
              userType == "차주" ? _carNumberController.text.trim() : null,
        );
      } else {
        await authService.register(
          loginId: _idController.text.trim(),
          password: _passwordController.text.trim(),
          email: _emailController.text.trim(),
          name: _nameController.text.trim(),
          phone: _phoneController.text.trim(),
          address: _addressController.text.trim(),
          detailAddress: _detailAddressController.text.trim(),
          carNumber:
              userType == "차주" ? _carNumberController.text.trim() : null,
          userType: userType,
        );
      }

      // 회원가입 완료 후 무조건 로그인 페이지로 이동
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => LoginPage()),
        );
      }
    } catch (e) {
      _showDialog("오류", e.toString());
    }
  }

  void _showDialog(String title, String msg) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(title),
        content: Text(msg),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("확인"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("회원가입", style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.indigo,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 10),
                // 사용자 유형
                Center(
                  child: ToggleButtons(
                    borderRadius: BorderRadius.circular(12),
                    selectedColor: Colors.white,
                    fillColor: Colors.indigo,
                    color: Colors.indigo,
                    isSelected: [userType == "화주", userType == "차주"],
                    onPressed: (index) =>
                        setState(() => userType = index == 0 ? "화주" : "차주"),
                    children: const [
                      Padding(
                        padding:
                            EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        child: Text("화주"),
                      ),
                      Padding(
                        padding:
                            EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        child: Text("차주"),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // ID + 중복 확인
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _idController,
                        focusNode: _idFocus,
                        onChanged: (val) {
                          setState(() {
                            _idError = _isValidId(val)
                                ? null
                                : "아이디는 4~12자의 영어/숫자여야 합니다.";
                          });
                        },
                        validator: (v) => _validateRequired(v, "아이디"),
                        decoration: InputDecoration(
                          labelText: "아이디",
                          errorText: _idError,
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 20,
                            horizontal: 12,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      height: 55,
                      child: ElevatedButton(
                        onPressed: _checkIdDuplicate,
                        child: const Text("중복 확인"),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // 비밀번호
                TextFormField(
                  controller: _passwordController,
                  focusNode: _passwordFocus,
                  obscureText: !showPassword,
                  onChanged: (val) {
                    setState(() {
                      _passwordError = _isValidPassword(val)
                          ? null
                          : "비밀번호는 최소 8자, 숫자+영문+특수문자 포함해야 합니다.";
                      if (_confirmPasswordController.text.isNotEmpty) {
                        _confirmError = _confirmPasswordController.text == val
                            ? null
                            : "비밀번호가 일치하지 않습니다.";
                      }
                    });
                  },
                  decoration: InputDecoration(
                    labelText: "비밀번호",
                    errorText: _passwordError,
                    contentPadding: const EdgeInsets.symmetric(
                      vertical: 20,
                      horizontal: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    suffixIcon: IconButton(
                      icon: Icon(
                        showPassword ? Icons.visibility_off : Icons.visibility,
                      ),
                      onPressed: () =>
                          setState(() => showPassword = !showPassword),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 비밀번호 확인
                TextFormField(
                  controller: _confirmPasswordController,
                  focusNode: _confirmFocus,
                  obscureText: !showConfirmPassword,
                  onChanged: (val) {
                    setState(() {
                      _confirmError = val == _passwordController.text
                          ? null
                          : "비밀번호가 일치하지 않습니다.";
                    });
                  },
                  decoration: InputDecoration(
                    labelText: "비밀번호 확인",
                    errorText: _confirmError,
                    contentPadding: const EdgeInsets.symmetric(
                      vertical: 20,
                      horizontal: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    suffixIcon: IconButton(
                      icon: Icon(
                        showConfirmPassword
                            ? Icons.visibility_off
                            : Icons.visibility,
                      ),
                      onPressed: () => setState(
                        () => showConfirmPassword = !showConfirmPassword,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 이메일 + 인증
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _emailController,
                        focusNode: _emailFocus,
                        readOnly: widget.isSocial,
                        validator: (v) => _validateRequired(v, "이메일"),
                        decoration: InputDecoration(
                          labelText: "이메일",
                          errorText: _emailError,
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 20,
                            horizontal: 12,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                    if (!widget.isSocial) ...[
                      const SizedBox(width: 8),
                      SizedBox(
                        height: 55,
                        child: ElevatedButton(
                          onPressed: codeSent ? _verifyCode : _sendEmailCode,
                          child: Text(codeSent
                              ? (verified ? "인증 완료" : "인증 확인")
                              : "인증번호 발송"),
                        ),
                      ),
                    ]
                  ],
                ),
                const SizedBox(height: 16),
                if (codeSent && !verified && !widget.isSocial)
                  TextFormField(
                    controller: _codeController,
                    decoration: InputDecoration(
                      labelText: "인증 코드",
                      contentPadding: const EdgeInsets.symmetric(
                        vertical: 20,
                        horizontal: 12,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                const SizedBox(height: 16),

                // 이름
                TextFormField(
                  controller: _nameController,
                  readOnly: widget.isSocial,
                  validator: (v) => _validateRequired(v, "이름"),
                  decoration: InputDecoration(
                    labelText: "이름",
                    contentPadding: const EdgeInsets.symmetric(
                      vertical: 20,
                      horizontal: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 전화번호
                TextFormField(
                  controller: _phoneController,
                  validator: (v) => _validateRequired(v, "전화번호"),
                  decoration: InputDecoration(
                    labelText: "전화번호",
                    contentPadding: const EdgeInsets.symmetric(
                      vertical: 20,
                      horizontal: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 주소
                TextFormField(
                  controller: _addressController,
                  readOnly: true,
                  onTap: _searchAddress,
                  validator: (v) => _validateRequired(v, "주소"),
                  decoration: InputDecoration(
                    labelText: "주소",
                    contentPadding: const EdgeInsets.symmetric(
                      vertical: 20,
                      horizontal: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.search),
                      onPressed: _searchAddress,
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 상세주소
                TextFormField(
                  controller: _detailAddressController,
                  decoration: InputDecoration(
                    labelText: "상세 주소",
                    contentPadding: const EdgeInsets.symmetric(
                      vertical: 20,
                      horizontal: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 차량번호 (차주만)
                if (userType == "차주")
                  TextFormField(
                    controller: _carNumberController,
                    validator: (v) => _validateRequired(v, "차량 번호"),
                    decoration: InputDecoration(
                      labelText: "차량 번호",
                      contentPadding: const EdgeInsets.symmetric(
                        vertical: 20,
                        horizontal: 12,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                const SizedBox(height: 16),

                // 회원가입 버튼
                SizedBox(
                  height: 55,
                  child: ElevatedButton(
                    onPressed: _signUp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.indigo,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      "회원가입",
                      style: TextStyle(fontSize: 18, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
