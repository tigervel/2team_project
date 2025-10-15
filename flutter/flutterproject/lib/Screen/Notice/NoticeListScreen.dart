import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutterproject/DTO/noticeDTOEx.dart';
import 'package:flutterproject/provider/NoticeProvider.dart';
import 'package:flutterproject/provider/TokenProvider.dart';

/// 공지사항 목록 화면
///
/// 기능:
/// - 공지사항 목록 표시 (페이지네이션)
/// - 카테고리 필터링
/// - Pull-to-Refresh
/// - 상세 화면으로 이동
class NoticeListScreen extends StatefulWidget {
  const NoticeListScreen({super.key});

  @override
  State<NoticeListScreen> createState() => _NoticeListScreenState();
}

class _NoticeListScreenState extends State<NoticeListScreen> {
  @override
  void initState() {
    super.initState();
    // 화면 로드 시 공지사항 목록 조회
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeData();
    });
  }

  /// 초기 데이터 로드
  Future<void> _initializeData() async {
    final noticeProvider = context.read<NoticeProvider>();
    final tokenProvider = context.read<Tokenprovider>();

    // 토큰 설정
    final token = tokenProvider.gettoken;
    if (token != null && token.isNotEmpty) {
      noticeProvider.setToken(token);
    }

    // 공지사항 목록 조회
    try {
      await noticeProvider.fetchNotices();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('공지사항을 불러오는데 실패했습니다: $e')),
        );
      }
    }
  }

  /// Pull-to-Refresh 핸들러
  Future<void> _onRefresh() async {
    final noticeProvider = context.read<NoticeProvider>();
    try {
      await noticeProvider.refreshNotices();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('새로고침 실패: $e')),
        );
      }
    }
  }

  /// 카테고리 변경 핸들러
  Future<void> _onCategoryChanged(NoticeCategory category) async {
    final noticeProvider = context.read<NoticeProvider>();
    noticeProvider.setCategory(category);
    try {
      await noticeProvider.fetchNotices();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('카테고리 필터링 실패: $e')),
        );
      }
    }
  }

  /// 페이지 변경 핸들러
  Future<void> _onPageChanged(int page) async {
    final noticeProvider = context.read<NoticeProvider>();
    noticeProvider.setPage(page);
    try {
      await noticeProvider.fetchNotices();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('페이지 로드 실패: $e')),
        );
      }
    }
  }

  /// 공지사항 클릭 핸들러 (상세 화면으로 이동)
  void _onNoticeClick(Notice notice) {
    Navigator.pushNamed(
      context,
      '/notice/detail',
      arguments: notice.noticeId,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('공지사항'),
        centerTitle: true,
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),
      body: Consumer<NoticeProvider>(
        builder: (context, noticeProvider, child) {
          // 로딩 상태
          if (noticeProvider.isLoading && noticeProvider.notices.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          // 에러 상태
          if (noticeProvider.errorMessage != null && noticeProvider.notices.isEmpty) {
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
                    onPressed: _initializeData,
                    child: const Text('다시 시도'),
                  ),
                ],
              ),
            );
          }

          return Column(
            children: [
              // 카테고리 필터
              _buildCategoryFilter(noticeProvider),

              // 공지사항 목록
              Expanded(
                child: RefreshIndicator(
                  onRefresh: _onRefresh,
                  child: noticeProvider.isEmpty
                      ? const Center(
                          child: Text('등록된 공지사항이 없습니다.'),
                        )
                      : ListView.builder(
                          itemCount: noticeProvider.notices.length,
                          itemBuilder: (context, index) {
                            final notice = noticeProvider.notices[index];
                            return _buildNoticeCard(notice);
                          },
                        ),
                ),
              ),

              // 페이지네이션
              if (noticeProvider.totalPages > 1)
                _buildPagination(noticeProvider),
            ],
          );
        },
      ),
    );
  }

  /// 카테고리 필터 위젯
  Widget _buildCategoryFilter(NoticeProvider noticeProvider) {
    return Container(
      height: 60,
      color: Colors.grey[100],
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        itemCount: NoticeCategory.values.length,
        itemBuilder: (context, index) {
          final category = NoticeCategory.values[index];
          final isActive = noticeProvider.activeCategory == category;

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: FilterChip(
              label: Text(category.displayName),
              selected: isActive,
              onSelected: (_) => _onCategoryChanged(category),
              backgroundColor: Colors.white,
              selectedColor: Colors.indigo,
              labelStyle: TextStyle(
                color: isActive ? Colors.white : Colors.black87,
                fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          );
        },
      ),
    );
  }

  /// 공지사항 카드 위젯
  Widget _buildNoticeCard(Notice notice) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      elevation: 2,
      child: InkWell(
        onTap: () => _onNoticeClick(notice),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 카테고리 뱃지
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.indigo.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      notice.category.displayName,
                      style: const TextStyle(
                        color: Colors.indigo,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const Spacer(),
                  Text(
                    _formatDate(notice.createdAt),
                    style: const TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // 제목
              Text(
                notice.title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),

              // 작성자 & 조회수
              Row(
                children: [
                  const Icon(Icons.person, size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    notice.authorName,
                    style: const TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Icon(Icons.visibility, size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    '${notice.viewCount}',
                    style: const TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// 페이지네이션 위젯
  Widget _buildPagination(NoticeProvider noticeProvider) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // 첫 페이지
          IconButton(
            icon: const Icon(Icons.first_page),
            onPressed: noticeProvider.isFirstPage
                ? null
                : () => _onPageChanged(0),
          ),

          // 이전 페이지
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: noticeProvider.hasPrevious
                ? () => _onPageChanged(noticeProvider.currentPage - 1)
                : null,
          ),

          // 페이지 정보
          Text(
            '${noticeProvider.currentPage + 1} / ${noticeProvider.totalPages}',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),

          // 다음 페이지
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: noticeProvider.hasNext
                ? () => _onPageChanged(noticeProvider.currentPage + 1)
                : null,
          ),

          // 마지막 페이지
          IconButton(
            icon: const Icon(Icons.last_page),
            onPressed: noticeProvider.isLastPage
                ? null
                : () => _onPageChanged(noticeProvider.totalPages - 1),
          ),
        ],
      ),
    );
  }

  /// 날짜 포맷팅 (yyyy-MM-dd)
  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    } catch (e) {
      return dateString.substring(0, 10);
    }
  }
}
