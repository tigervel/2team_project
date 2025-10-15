import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutterproject/DTO/noticeDTOEx.dart';
import 'package:flutterproject/provider/NoticeProvider.dart';
import 'package:flutterproject/provider/TokenProvider.dart';

/// 공지사항 상세 화면
class NoticeDetailScreen extends StatefulWidget {
  final int noticeId;

  const NoticeDetailScreen({
    super.key,
    required this.noticeId,
  });

  @override
  State<NoticeDetailScreen> createState() => _NoticeDetailScreenState();
}

class _NoticeDetailScreenState extends State<NoticeDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_){
       _loadNoticeDetail();
    });
   
  }

  Future<void> _loadNoticeDetail() async {
    final noticeProvider = context.read<NoticeProvider>();
    final tokenProvider = context.read<Tokenprovider>();

    // 토큰 설정
    final token = tokenProvider.gettoken;
    if (token != null && token.isNotEmpty) {
      noticeProvider.setToken(token);
    }

    // 상세 조회
    try {
      await noticeProvider.fetchNoticeDetail(widget.noticeId);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('공지사항을 불러오는데 실패했습니다: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('공지사항 상세'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),
      body: Consumer<NoticeProvider>(
        builder: (context, noticeProvider, child) {
          // 로딩 상태
          if (noticeProvider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          // 에러 상태
          if (noticeProvider.errorMessage != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    noticeProvider.errorMessage!,
                    style: const TextStyle(fontSize: 16),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: _loadNoticeDetail,
                    child: const Text('다시 시도'),
                  ),
                ],
              ),
            );
          }

          // 공지사항이 없음
          final notice = noticeProvider.selectedNotice;
          if (notice == null) {
            return const Center(
              child: Text('공지사항을 찾을 수 없습니다.'),
            );
          }

          // 상세 정보 표시
          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 헤더 (카테고리, 제목)
                Container(
                  color: Colors.indigo,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 카테고리
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          notice.category.displayName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // 제목
                      Text(
                        notice.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),

                      // 작성자 & 작성일
                      Row(
                        children: [
                          const Icon(Icons.person, size: 16, color: Colors.white70),
                          const SizedBox(width: 4),
                          Text(
                            notice.authorName,
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(width: 16),
                          const Icon(Icons.calendar_today, size: 16, color: Colors.white70),
                          const SizedBox(width: 4),
                          Text(
                            _formatDate(notice.createdAt),
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(width: 16),
                          const Icon(Icons.visibility, size: 16, color: Colors.white70),
                          const SizedBox(width: 4),
                          Text(
                            '${notice.viewCount}',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // 내용
                Container(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        notice.content,
                        style: const TextStyle(
                          fontSize: 16,
                          height: 1.6,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    } catch (e) {
      return dateString.substring(0, 10);
    }
  }
}
