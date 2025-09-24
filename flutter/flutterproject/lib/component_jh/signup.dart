import 'package:flutter/material.dart';
import 'package:kpostal/kpostal.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final _formKey = GlobalKey<FormState>();

  // Controllers
  final _idController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _emailController = TextEditingController();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _detailAddressController = TextEditingController();
  final _carNumberController = TextEditingController();

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

  // 예시 중복 아이디
  final List<String> existingIds = ["test01", "user123"];

  @override
  void initState() {
    super.initState();

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
    _idFocus.dispose();
    _passwordFocus.dispose();
    _confirmFocus.dispose();
    _emailFocus.dispose();
    super.dispose();
  }

  // 정규식
  bool _isValidId(String id) => RegExp(r'^[a-zA-Z0-9]{4,12}$').hasMatch(id);
  bool _isValidPassword(String pw) =>
      RegExp(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$').hasMatch(pw);
  bool _isValidEmail(String email) =>
      RegExp(r'^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$').hasMatch(email);

  // 중복 확인
  void _checkIdDuplicate() {
    final id = _idController.text;
    if (!_isValidId(id)) {
      _showDialog("아이디 형식 오류", "아이디는 4~12자의 영어/숫자로 입력해야 합니다.");
    } else if (existingIds.contains(id)) {
      _showDialog("중복 아이디", "이미 사용 중인 아이디입니다.");
    } else {
      _showDialog("사용 가능", "사용 가능한 아이디입니다.");
    }
  }

  // 이메일 인증
  void _sendEmailVerification() {
    final email = _emailController.text;
    if (!_isValidEmail(email)) {
      _showDialog("이메일 형식 오류", "올바른 이메일 주소를 입력해주세요.");
    } else {
      _showDialog("인증 메일 발송", "$email 로 인증 메일을 발송했습니다.");
    }
  }

  void _showDialog(String title, String msg) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(title),
        content: Text(msg),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("확인"))
        ],
      ),
    );
  }

  // Kpostal 주소 검색 (수정된 부분)
  Future<void> _searchAddress() async {
    final result = await Navigator.push<Kpostal>(
      context,
      MaterialPageRoute(
        fullscreenDialog: true,
        builder: (_) => Scaffold(
          appBar: AppBar(title: const Text("주소 검색")),
          body: KpostalView(
            useLocalServer: true,
            localPort: 1024,
          ),
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

  void _signUp() {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _idError = _isValidId(_idController.text) ? null : "아이디는 4~12자의 영어/숫자여야 합니다.";
        _passwordError = _isValidPassword(_passwordController.text)
            ? null
            : "비밀번호는 최소 8자, 숫자+영문+특수문자 포함해야 합니다.";
        _confirmError = _confirmPasswordController.text == _passwordController.text
            ? null
            : "비밀번호가 일치하지 않습니다.";
        _emailError = _isValidEmail(_emailController.text) ? null : "올바른 이메일 형식이 아닙니다.";
      });

      if (_idError != null || _passwordError != null || _confirmError != null || _emailError != null) return;

      _showDialog("가입 정보",
          "회원구분: $userType\nID: ${_idController.text}\n이메일: ${_emailController.text}\n주소: ${_addressController.text} ${_detailAddressController.text}\n차량번호: ${userType == "차주" ? _carNumberController.text : "없음"}");
    }
  }

  String? _validateRequired(String? value, String fieldName) {
    if (value == null || value.trim().isEmpty) return "$fieldName 입력은 필수입니다.";
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("회원가입")),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
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
                            _idError = _isValidId(val) ? null : "아이디는 4~12자의 영어/숫자여야 합니다.";
                          });
                        },
                        validator: (v) => _validateRequired(v, "아이디"),
                        decoration: InputDecoration(
                          labelText: "아이디",
                          errorText: _idError,
                          contentPadding:
                              const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12)),
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
                    )
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
                    contentPadding:
                        const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                    suffixIcon: IconButton(
                      icon: Icon(
                          showPassword ? Icons.visibility_off : Icons.visibility),
                      onPressed: () => setState(() => showPassword = !showPassword),
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
                    contentPadding:
                        const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                    suffixIcon: IconButton(
                      icon: Icon(showConfirmPassword
                          ? Icons.visibility_off
                          : Icons.visibility),
                      onPressed: () =>
                          setState(() => showConfirmPassword = !showConfirmPassword),
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
                        onChanged: (val) {
                          setState(() {
                            _emailError = _isValidEmail(val) ? null : "올바른 이메일 형식이 아닙니다.";
                          });
                        },
                        validator: (v) => _validateRequired(v, "이메일"),
                        decoration: InputDecoration(
                          labelText: "이메일",
                          errorText: _emailError,
                          contentPadding:
                              const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      height: 55,
                      child: ElevatedButton(
                        onPressed: _sendEmailVerification,
                        child: const Text("인증하기"),
                      ),
                    )
                  ],
                ),
                const SizedBox(height: 16),

                // 이름
                TextFormField(
                  controller: _nameController,
                  validator: (v) => _validateRequired(v, "이름"),
                  decoration: InputDecoration(
                    labelText: "이름",
                    contentPadding:
                        const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),

                // 전화번호
                TextFormField(
                  controller: _phoneController,
                  validator: (v) => _validateRequired(v, "전화번호"),
                  decoration: InputDecoration(
                    labelText: "전화번호",
                    contentPadding:
                        const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
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
                    contentPadding:
                        const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
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
                    contentPadding:
                        const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
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
                      contentPadding:
                          const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                const SizedBox(height: 24),

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
