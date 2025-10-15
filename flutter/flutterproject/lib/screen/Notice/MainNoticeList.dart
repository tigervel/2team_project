import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutterproject/API/ApiConfig.dart';
import 'package:flutterproject/DTO/noticeDTOEx.dart';
import 'package:http/http.dart' as http;

class MainNoticeList extends StatefulWidget {
  const MainNoticeList({super.key});

  @override
  State<MainNoticeList> createState() => _NoticeListState();
}


class _NoticeListState extends State<MainNoticeList> {
  late Future<List<Notice>> _noticesFuture;
    void _onNoticeClick(Notice notice) {
    Navigator.pushNamed(
      context,
      '/notice/detail',
      arguments: notice.noticeId,
    );
  }

  @override
  void initState() {
    super.initState();
    _noticesFuture = getNotices();
  }

  Future<List<Notice>> getNotices() async {
    final String baseUrl = Apiconfig.baseUrl;
    final response = await http.get(
      Uri.parse('$baseUrl/api/notices?size=3&sort=createdAt,desc'),
    );

    if (response.statusCode == 200) {
      final String responseBody = utf8.decode(response.bodyBytes);
      final Map<String, dynamic> body = json.decode(responseBody);
      final List<dynamic> noticeList = body['content'];

      return noticeList.map((json) => Notice.fromJson(json)).toList();
    } else {
      throw Exception('공지사항 불러오기 실패');
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Notice>>(
      future: _noticesFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text("오류: ${snapshot.error}"));
        }
        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text("등록된 공지사항이 없습니다."));
        }

        final notices = snapshot.data!;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "📢 공지사항",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: notices.length,
              itemBuilder: (context, index) {
                final notice = notices[index];
                return Card(
                  child: ListTile(
                    title: Text(
                      notice.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    subtitle: Text('작성일: ${notice.createdAt.substring(0, 10)}'),
                    onTap: () => _onNoticeClick(notice),
                  ),
                );
              },
            ),
          ],
        );
      },
    );
  }
}
