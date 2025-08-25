import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Search,
  Person,
  CalendarToday,
  ExpandMore,
  Visibility,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import * as noticeApi from '../../../api/noticeApi';
import useCustomLogin from '../../../hooks/useCustomLogin';
import NoticeEditForm from './NoticeEditForm'; // Import the new edit form

const NoboardComponent = () => {
  const { isAdmin, currentUserId, loginState } = useCustomLogin();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [expandedNotices, setExpandedNotices] = useState(new Set());

  // State for creating/editing notices
  const [isNoticeFormOpen, setIsNoticeFormOpen] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [noticeFormData, setNoticeFormData] = useState({
    title: '',
    content: ''
  });

  const ITEMS_PER_PAGE = 5; // Number of notices per page

  // Common userInfo creation function
  const createUserInfo = (defaultUserName = '익명') => ({
    userId: currentUserId || loginState.memberId || 'anonymous',
    userName: loginState.nickname || defaultUserName
  });

  // Fetch notices from the backend API
  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        keyword: searchTerm,
        page: currentPage - 1, // Backend is 0-indexed
        size: ITEMS_PER_PAGE
      };
      
      const response = await noticeApi.getNotices(params);
      
      const transformedData = response.content.map(item => ({
        id: item.noticeId,
        title: item.title,
        content: item.content || '',
        author: item.authorName ? decodeURIComponent(item.authorName) : item.authorName,
        authorId: item.authorId || '',
        date: item.createdAt ? item.createdAt.split('T')[0] : '',
        views: item.viewCount || 0,
      }));
      
      setNotices(transformedData);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
      let errorMessage = '공지사항을 불러오는 중 오류가 발생했습니다.';
      if (error.response && error.response.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = '네트워크 연결을 확인해주세요.';
      }
      setError(errorMessage);
      setNotices([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notices on component mount and when dependencies change
  useEffect(() => {
    fetchNotices();
  }, [searchTerm, currentPage]);

  const toggleNoticeExpansion = async (noticeId) => {
    const newExpanded = new Set(expandedNotices);
    if (newExpanded.has(noticeId)) {
      newExpanded.delete(noticeId);
    } else {
      // Increment view count when a notice is expanded
      try {
        await noticeApi.getNoticeDetail(noticeId); // This call increments view count on backend
        fetchNotices(); // Refresh list to show updated view count
      } catch (error) {
        console.error('Failed to increment view count:', error);
      }
      newExpanded.add(noticeId);
    }
    setExpandedNotices(newExpanded);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle opening the notice form (for create or edit)
  const handleOpenNoticeForm = (item = null) => {
    if (item) {
      setEditingNoticeId(item.id);
      setNoticeFormData({ title: item.title, content: item.content });
    } else {
      setEditingNoticeId(null);
      setNoticeFormData({ title: '', content: '' });
    }
    setIsNoticeFormOpen(true);
  };

  // Handle closing the notice form
  const handleCloseNoticeForm = () => {
    setIsNoticeFormOpen(false);
    setEditingNoticeId(null);
    setNoticeFormData({ title: '', content: '' });
  };

  // Handle submitting the notice form (create or update)
  const handleSubmitNoticeForm = async () => {
    try {
      const userInfo = createUserInfo('관리자'); // Notices are managed by admin
      if (editingNoticeId) {
        // Update existing notice
        await noticeApi.updateNotice(editingNoticeId, noticeFormData, userInfo);
        alert('공지사항이 수정되었습니다.');
      } else {
        // Create new notice
        await noticeApi.createNotice(noticeFormData, userInfo);
        alert('새 공지사항이 등록되었습니다.');
      }
      fetchNotices(); // Refresh the list
      handleCloseNoticeForm();
    } catch (err) {
      console.error('Failed to save notice:', err);
      alert(`공지사항 저장에 실패했습니다: ${err.response?.data?.message || err.message}`);
    }
  };

  // Handle deleting a notice
  const handleDeleteNotice = async (noticeId) => {
    if (window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
      try {
        const userInfo = createUserInfo('관리자');
        await noticeApi.deleteNotice(noticeId, userInfo);
        alert('공지사항이 삭제되었습니다.');
        fetchNotices(); // Refresh the list
      } catch (err) {
        console.error('Failed to delete notice:', err);
        alert(`공지사항 삭제에 실패했습니다: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          공지사항
        </Typography>
        <Typography variant="h6" color="text.secondary">
          새로운 소식과 중요한 정보를 확인하세요
        </Typography>
      </Box>

      <Box display="flex" gap={2} mb={3} alignItems="center">
        <TextField
          fullWidth
          placeholder="공지사항 검색..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        {isAdmin && (
          <Button 
            variant="contained" 
            onClick={() => handleOpenNoticeForm()}
            startIcon={<AddIcon />}
            sx={{ minWidth: 140, height: 56 }}
          >
            새 공지 작성
          </Button>
        )}
      </Box>

      <Box mb={3}>
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={6}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              공지사항을 불러오는 중입니다...
            </Typography>
          </Box>
        ) : error ? (
          <Box textAlign="center" py={6}>
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
            <Button variant="outlined" onClick={fetchNotices} sx={{ mt: 2 }}>
              다시 시도
            </Button>
          </Box>
        ) : notices.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography color="text.secondary" variant="h6" gutterBottom>
              등록된 공지사항이 없습니다.
            </Typography>
            {isAdmin && (
              <Button variant="contained" onClick={() => handleOpenNoticeForm()}>
                첫 공지 작성하기
              </Button>
            )}
          </Box>
        ) : (
          notices.map((item) => {
            const isExpanded = expandedNotices.has(item.id);
            const isEditing = editingNoticeId === item.id;

            return (
              <Box key={item.id} mb={2}>
                {isEditing && (
                  <NoticeEditForm
                    item={item}
                    onSave={handleSubmitNoticeForm}
                    onCancel={handleCloseNoticeForm}
                    isVisible={true}
                  />
                )}
                {!isEditing && (
                  <Card 
                    sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                    onClick={() => toggleNoticeExpansion(item.id)}
                  >
                    <CardHeader
                      title={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label="공지" size="small" color="primary" />
                          <Typography variant="h6" component="h3">
                            {item.title}
                          </Typography>
                        </Box>
                      }
                      action={
                        <IconButton>
                          <ExpandMore sx={{ 
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                          }} />
                        </IconButton>
                      }
                    />
                    
                    {isExpanded && (
                      <CardContent sx={{ pt: 0 }}>
                        <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {item.content}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" gap={2}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Person fontSize="small" />
                              <Typography variant="body2" color="text.secondary">
                                {item.author}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <CalendarToday fontSize="small" />
                              <Typography variant="body2" color="text.secondary">
                                {item.date}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Visibility fontSize="small" />
                              <Typography variant="body2" color="text.secondary">
                                {item.views}
                              </Typography>
                            </Box>
                          </Box>
                          {isAdmin && (
                            <Stack direction="row" spacing={1}>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                startIcon={<EditIcon />} 
                                onClick={(e) => { e.stopPropagation(); handleOpenNoticeForm(item); }}
                              >
                                수정
                              </Button>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="error" 
                                startIcon={<DeleteIcon />} 
                                onClick={(e) => { e.stopPropagation(); handleDeleteNotice(item.id); }}
                              >
                                삭제
                              </Button>
                            </Stack>
                          )}
                        </Box>
                      </CardContent>
                    )}
                  </Card>
                )}
              </Box>
            );
          })
        )}
      </Box>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Notice Create/Edit Dialog */}
      <Dialog 
        open={isNoticeFormOpen} 
        onClose={handleCloseNoticeForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingNoticeId ? '공지사항 수정' : '새 공지사항 작성'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="제목"
              fullWidth
              value={noticeFormData.title}
              onChange={(e) => setNoticeFormData({ ...noticeFormData, title: e.target.value })}
              required
            />
            <TextField
              label="내용"
              multiline
              rows={6}
              fullWidth
              value={noticeFormData.content}
              onChange={(e) => setNoticeFormData({ ...noticeFormData, content: e.target.value })}
              placeholder="공지 내용을 자세히 작성해주세요"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoticeForm}>취소</Button>
          <Button onClick={handleSubmitNoticeForm} variant="contained">
            {editingNoticeId ? '수정 완료' : '공지 등록'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NoboardComponent;