// lib/features/vehicle/edit_vehicle_inform_page.dart
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/auth_token.dart';

/// =================== 공통 상수/유틸 ===================
const String kApiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'http://10.0.2.2:8080', // Android 에뮬레이터 기본
);

// 구/신 경로 모두 보정
String? toPreviewUrl(String? p) {
  if (p == null || p.isEmpty) return null;
  if (p.startsWith('http')) return p;
  if (p.startsWith('/g2i4/uploads/')) return '$kApiBase$p';
  if (p.startsWith('/uploads/')) return '$kApiBase/g2i4$p'; // 구버전 보정
  return '$kApiBase/g2i4/uploads/cargo/${Uri.encodeComponent(p)}'; // 파일명만 있는 경우
}

/// =================== 모델 ===================
class VehicleItem {
  final int no;
  final String name;
  final String weight;
  final String? imagePath;
  final String? preview;

  VehicleItem({
    required this.no,
    required this.name,
    required this.weight,
    required this.imagePath,
    required this.preview,
  });

  factory VehicleItem.fromJson(Map<String, dynamic> j) {
    final noRaw = j['cargoNo'] ?? j['no'] ?? 0;
    final no = noRaw is String ? int.tryParse(noRaw) ?? 0 : (noRaw as int);
    final name = (j['cargoName'] ?? j['name'] ?? '').toString();
    final weight = (j['cargoCapacity'] ?? j['weight'] ?? '').toString();
    final img = (j['cargoImage'] ?? j['imagePath'])?.toString();
    return VehicleItem(
      no: no,
      name: name,
      weight: weight,
      imagePath: img,
      preview: toPreviewUrl(img),
    );
  }
}

/// =================== 페이지 ===================
/// cargoId를 넘겨도 되고(null 가능), 안 넘기면 /g2i4/user/info 에서 찾아서 사용.
class EditVehicleInformPage extends StatefulWidget {
  final String? cargoId; // optional

  const EditVehicleInformPage({super.key, this.cargoId});

  static const routeName = '/edit-vehicle';

  @override
  State<EditVehicleInformPage> createState() => _EditVehicleInformPageState();
}

class _EditVehicleInformPageState extends State<EditVehicleInformPage> {
  late final Dio dio;

  bool _loading = true;
  String? _cargoId;

  List<VehicleItem> _vehicles = [];
  List<String> _weightOptions = ['0.5톤', '1톤', '2톤', '3톤', '4톤', '5톤이상']; // 폴백

  // 편집 상태
  bool _editorOpen = false;
  int? _editingIndex; // null이면 신규
  final _nameCtrl = TextEditingController();
  String _selectedWeight = '';
  File? _pickedImageFile;
  String? _previewUrl; // 기존/로컬 미리보기

  @override
  void initState() {
    super.initState();
    dio = Dio(BaseOptions(baseUrl: kApiBase));
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await loadAccessToken();
        if (token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));

    // 1) 외부에서 cargoId 전달되면 그대로 사용
    if (widget.cargoId != null && widget.cargoId!.trim().isNotEmpty) {
      _cargoId = widget.cargoId!.trim();
      _loadAll();
    } else {
      // 2) 없으면 사용자 정보에서 알아내기
      _resolveCargoIdAndLoad();
    }
  }

  Future<void> _resolveCargoIdAndLoad() async {
    setState(() => _loading = true);
    try {
      final res = await dio.get('/g2i4/user/info');
      final raw = res.data ?? {};
      final data = raw['data'] ??
          raw['user'] ??
          raw['payload'] ??
          raw['profile'] ??
          raw['account'] ??
          raw['result'] ??
          {};

      final candidates = [
        data['cargoId'],
        data['cargo_id'],
        raw['cargoId'],
        data['id'], // 혹시 id가 cargoId인 경우도 고려
      ].where((e) => e != null && e.toString().trim().isNotEmpty).toList();

      if (candidates.isNotEmpty) {
        _cargoId = candidates.first.toString();
        await _loadAll();
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('cargoId를 찾을 수 없습니다. 로그인 정보를 확인하세요.')),
          );
          setState(() => _loading = false);
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('사용자 정보 조회 실패: $e')),
        );
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _loadAll() async {
    if (_cargoId == null || _cargoId!.isEmpty) return;
    setState(() => _loading = true);
    try {
      await Future.wait([_fetchVehicles(), _fetchWeightOptions()]);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _fetchVehicles() async {
    final res = await dio.get('/g2i4/cargo/list/${_cargoId!}');
    final list = (res.data as List? ?? [])
        .map((e) => VehicleItem.fromJson(e as Map<String, dynamic>))
        .toList();
    setState(() => _vehicles = list);
  }

  Future<void> _fetchWeightOptions() async {
    try {
      final res = await dio.get('/g2i4/admin/fees/basic/rows');
      final raw =
          (res.data as List? ?? []).map((e) => e?.toString() ?? '').toList();
      final uniq = raw.toSet().where((e) => e.isNotEmpty).toList();
      if (uniq.isNotEmpty) setState(() => _weightOptions = uniq);
    } catch (_) {
      // 폴백 유지
    }
  }

  // ===== 편집기 열고 닫기 =====
  void _openEditor({int? index}) {
    setState(() {
      _editingIndex = index;
      if (index != null) {
        final v = _vehicles[index];
        _nameCtrl.text = v.name;
        _selectedWeight = v.weight;
        _previewUrl = v.preview;
        _pickedImageFile = null;
      } else {
        _nameCtrl.clear();
        _selectedWeight = '';
        _previewUrl = null;
        _pickedImageFile = null;
      }
      _editorOpen = true;
    });
  }

  void _closeEditor() {
    setState(() {
      _editorOpen = false;
      _editingIndex = null;
      _pickedImageFile = null;
      _previewUrl = null;
      _nameCtrl.clear();
      _selectedWeight = '';
    });
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked =
        await picker.pickImage(source: ImageSource.gallery, imageQuality: 92);
    if (picked == null) return;
    final file = File(picked.path);
    final size = await file.length();
    if (size > 8 * 1024 * 1024) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('이미지는 8MB 이하만 업로드 가능합니다.')),
        );
      }
    } else {
      setState(() {
        _pickedImageFile = file;
        _previewUrl = null; // 로컬 파일 우선
      });
    }
  }

  // ===== 저장(등록/수정) & 삭제 =====
  Future<void> _saveVehicle() async {
    if (_cargoId == null || _cargoId!.isEmpty) return;

    final name = _nameCtrl.text.trim();
    final weight = _selectedWeight.trim();
    if (name.isEmpty || weight.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('이름과 적재 무게를 입력/선택해주세요.')),
      );
      return;
    }

    try {
      int? cargoNo;
      if (_editingIndex != null) {
        // 수정
        cargoNo = _vehicles[_editingIndex!].no;
        final res = await dio.put('/g2i4/cargo/update/$cargoNo', data: {
          'name': name,
          'weight': weight,
        });
        final r = res.data;
        if (r != null && r['cargoNo'] != null) {
          cargoNo = r['cargoNo'] is String
              ? int.tryParse(r['cargoNo'].toString()) ?? cargoNo
              : r['cargoNo'];
        }
      } else {
        // 등록
        final res = await dio.post('/g2i4/cargo/add/${_cargoId!}', data: {
          'name': name,
          'weight': weight,
        });
        final r = res.data;
        if (r != null && r['cargoNo'] != null) {
          cargoNo = r['cargoNo'] is String
              ? int.tryParse(r['cargoNo'].toString())
              : r['cargoNo'];
        }
      }

      if (cargoNo == null) {
        throw Exception('cargoNo를 확인할 수 없습니다.');
      }

      // 이미지 업로드
      if (_pickedImageFile != null) {
        final form = FormData.fromMap({
          'image': await MultipartFile.fromFile(
            _pickedImageFile!.path,
            filename: _pickedImageFile!.path.split('/').last,
          ),
        });
        await dio.post(
          '/g2i4/cargo/upload/${cargoNo.toString().trim()}',
          data: form,
          options: Options(headers: {'Content-Type': 'multipart/form-data'}),
        );
      }

      await _fetchVehicles();
      _closeEditor();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('차량 저장 실패: $e')),
      );
    }
  }

  Future<void> _deleteVehicle(int index) async {
    final target = _vehicles[index];
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('삭제 확인'),
        content: const Text('정말 삭제하시겠습니까?'),
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

    try {
      await dio.delete('/g2i4/cargo/delete/${target.no}');
      await _fetchVehicles();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('삭제 실패: $e')),
      );
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  /// =================== UI ===================
  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    // cargoId가 끝내 없으면 안내
    if (_cargoId == null || _cargoId!.isEmpty) {
      return const Scaffold(
        body: Center(child: Text('cargoId를 찾을 수 없어 차량 관리를 표시할 수 없습니다.')),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        title: const Text('내 차량 관리'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: LayoutBuilder(
          builder: (context, c) {
            // 가로폭에 따라 카드 1~3열 반응형
            final crossAxisCount =
                c.maxWidth >= 1200 ? 3 : (c.maxWidth >= 800 ? 2 : 1);

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 그리드
                Expanded(
                  child: GridView.builder(
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: crossAxisCount,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      childAspectRatio: 1, // 1:1 카드
                    ),
                    itemCount: _vehicles.length + 1, // +1 = 신규 추가 카드
                    itemBuilder: (context, i) {
                      if (i == _vehicles.length) {
                        // 추가 카드
                        return InkWell(
                          onTap: () => _openEditor(),
                          child: Card(
                            shape: RoundedRectangleBorder(
                              side: const BorderSide(
                                  color: Color(0xFFCCCCCC), width: 2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Center(
                              child: Text('＋', style: TextStyle(fontSize: 42)),
                            ),
                          ),
                        );
                      }
                      final v = _vehicles[i];
                      return _VehicleCard(
                        item: v,
                        onEdit: () => _openEditor(index: i),
                        onDelete: () => _deleteVehicle(i),
                      );
                    },
                  ),
                ),

                // 편집 모달(바텀 시트 스타일)
                if (_editorOpen)
                  _EditorSheet(
                    title: '차량 정보 입력',
                    nameController: _nameCtrl,
                    selectedWeight: _selectedWeight,
                    weightOptions: _weightOptions,
                    previewUrl: _previewUrl,
                    localImage: _pickedImageFile,
                    onPickImage: _pickImage,
                    onWeightChanged: (w) =>
                        setState(() => _selectedWeight = w ?? ''),
                    onClose: _closeEditor,
                    onSave: _saveVehicle,
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}

/// =================== 위젯들 ===================
class _VehicleCard extends StatelessWidget {
  final VehicleItem item;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _VehicleCard({
    required this.item,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            // 이미지 영역
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFE5E7EB),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: item.preview != null
                      ? Image.network(
                          item.preview!,
                          fit: BoxFit.contain,
                          width: double.infinity,
                          height: double.infinity,
                          errorBuilder: (_, __, ___) => const _NoImage(),
                        )
                      : const _NoImage(),
                ),
              ),
            ),
            const SizedBox(height: 8),
            // 텍스트
            Text(item.name,
                style: const TextStyle(fontWeight: FontWeight.bold)),
            Text(item.weight),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                      onPressed: onEdit, child: const Text('수정')),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: onDelete,
                    style:
                        ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    child: const Text('삭제'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _NoImage extends StatelessWidget {
  const _NoImage();

  @override
  Widget build(BuildContext context) {
    return const Text(
      'No Image',
      style: TextStyle(color: Color(0xFF6B7280), fontSize: 16),
    );
  }
}

// 바텀 시트 스타일 편집기 (Modal 대체)
class _EditorSheet extends StatelessWidget {
  final String title;
  final TextEditingController nameController;
  final String selectedWeight;
  final List<String> weightOptions;
  final String? previewUrl;
  final File? localImage;
  final VoidCallback onPickImage;
  final ValueChanged<String?> onWeightChanged;
  final VoidCallback onClose;
  final VoidCallback onSave;

  const _EditorSheet({
    required this.title,
    required this.nameController,
    required this.selectedWeight,
    required this.weightOptions,
    required this.previewUrl,
    required this.localImage,
    required this.onPickImage,
    required this.onWeightChanged,
    required this.onClose,
    required this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    // 화면 아래에 고정되는 카드 느낌
    return Align(
      alignment: Alignment.bottomCenter,
      child: Material(
        elevation: 12,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        child: Container(
          width: double.infinity,
          constraints: const BoxConstraints(maxWidth: 1000),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // 헤더
              Row(
                children: [
                  Expanded(
                    child: Text(title,
                        style: Theme.of(context).textTheme.titleMedium),
                  ),
                  IconButton(onPressed: onClose, icon: const Icon(Icons.close)),
                ],
              ),
              const SizedBox(height: 8),
              // 본문
              LayoutBuilder(builder: (context, c) {
                final vertical = c.maxWidth < 700;
                return Flex(
                  direction: vertical ? Axis.vertical : Axis.horizontal,
                  crossAxisAlignment: vertical
                      ? CrossAxisAlignment.stretch
                      : CrossAxisAlignment.start,
                  children: [
                    // 미리보기
                    Expanded(
                      child: AspectRatio(
                        aspectRatio: 5 / 3,
                        child: Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFFE5E7EB),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Center(
                            child: localImage != null
                                ? Image.file(localImage!, fit: BoxFit.contain)
                                : (previewUrl != null
                                    ? Image.network(
                                        previewUrl!,
                                        fit: BoxFit.contain,
                                        errorBuilder: (_, __, ___) =>
                                            const _NoImage(),
                                      )
                                    : const _NoImage()),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16, height: 16),
                    // 폼
                    Expanded(
                      child: Column(
                        children: [
                          TextField(
                            controller: nameController,
                            decoration: const InputDecoration(
                              labelText: '차량 이름',
                              border: OutlineInputBorder(),
                            ),
                          ),
                          const SizedBox(height: 12),
                          InputDecorator(
                            decoration: const InputDecoration(
                              labelText: '적재 무게',
                              border: OutlineInputBorder(),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                isExpanded: true,
                                value: selectedWeight.isEmpty
                                    ? null
                                    : selectedWeight,
                                items: weightOptions
                                    .map((w) => DropdownMenuItem(
                                        value: w, child: Text(w)))
                                    .toList(),
                                onChanged: onWeightChanged,
                                hint: const Text('선택'),
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            height: 44,
                            child: OutlinedButton(
                              onPressed: onPickImage,
                              child: const Text('이미지 업로드'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              }),
              const SizedBox(height: 16),
              // 저장 버튼
              SizedBox(
                width: double.infinity,
                height: 48,
                child:
                    ElevatedButton(onPressed: onSave, child: const Text('저장')),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
