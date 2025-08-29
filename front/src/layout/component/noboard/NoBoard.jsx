import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { getNotices } from '../../../api/noticeApi';

const BulletinBoard = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0); // 백엔드는 0 기반 페이지
  const [notices, setNotices] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // 공지사항 카테고리 정의
  const categories = [
    { id: 'all', name: '전체' },
    { id: 'system', name: '시스템' },
    { id: 'service', name: '서비스' },
    { id: 'update', name: '업데이트' },
    { id: 'maintenance', name: '점검' }
  ];

  // 공지사항 목록 로드
  const loadNotices = async (page = 0) => {
    try {
      setLoading(true);
      const response = await getNotices({ page, size: 10 });
      setNotices(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
      setError(null);
    } catch (err) {
      console.error('공지사항 로드 실패:', err);
      setError('공지사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices(currentPage);
  }, [currentPage, activeCategory]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value - 1); // MUI Pagination은 1 기반, 백엔드는 0 기반
  };

  const handleRowClick = (noticeId) => {
    navigate(`/noboard/post/${noticeId}`);
  };

  const handleNewPost = () => {
    navigate('/noboard/write');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main',
          py: 6,
          px: 3,
          borderRadius: 2,
          mb: 4,
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            color: 'primary.contrastText',
            fontWeight: 'bold',
            mb: 1
          }}
        >
          공지사항
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'primary.contrastText',
            opacity: 0.8
          }}
        >
          최신 업데이트와 중요한 안내사항을 확인하세요
        </Typography>
      </Box>

      {/* Category Tabs and New Post Button */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        {/* Category Tabs */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1
          }}
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'contained' : 'outlined'}
              onClick={() => setActiveCategory(category.id)}
              sx={{ 
                minWidth: 100, 
                borderRadius: 2
              }}
            >
              {category.name}
            </Button>
          ))}
        </Box>

        {/* New Post Button */}
        <Button 
          variant="contained" 
          onClick={handleNewPost}
          startIcon={<AddIcon />}
          sx={{ 
            minWidth: 140,
            height: 48,
            borderRadius: 2
          }}
        >
          새 게시글
        </Button>
      </Box>

      {/* Notice Table */}
      <Card sx={{ overflow: 'hidden', boxShadow: 2 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold', width: 80 }}>번호</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>제목</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 120 }}>작성자</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 120 }}>작성일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      로딩 중...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    <Alert severity="error">{error}</Alert>
                  </TableCell>
                </TableRow>
              ) : notices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      등록된 공지사항이 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                notices.map((notice) => (
                  <TableRow
                    key={notice.noticeId}
                    hover
                    onClick={() => handleRowClick(notice.noticeId)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {notice.noticeId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label="공지" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.primary',
                            '&:hover': {
                              color: 'primary.main'
                            }
                          }}
                        >
                          {notice.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {notice.authorName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage + 1} // MUI는 1 기반, 백엔드는 0 기반
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default BulletinBoard;