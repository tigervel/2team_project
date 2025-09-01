import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Stack,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowLeftIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { getNoticeDetail, createNotice, updateNotice } from '../../../api/noticeApi';
import useCustomLogin from '../../../hooks/useCustomLogin';

const WritePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { currentUserId, loginState } = useCustomLogin();

  const [formData, setFormData] = useState({
    title: '',
    author: '관리자',
    content: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });


  // 수정 모드일 때 기존 데이터 로드
  const loadNoticeForEdit = async () => {
    try {
      setLoading(true);
      const response = await getNoticeDetail(id);
      setFormData({
        title: response.title,
        author: response.authorName,
        content: response.content
      });
    } catch (err) {
      console.error('공지사항 로드 실패:', err);
      setSnackbar({ open: true, message: '공지사항을 불러오는데 실패했습니다.', severity: 'error' });
      navigate('/noboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      loadNoticeForEdit();
    }
  }, [id, isEditing]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!formData.author.trim()) {
      newErrors.author = '작성자를 입력해주세요.';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // 사용자가 입력한 작성자명을 userInfo에 설정
      const userInfo = {
        userId: currentUserId || loginState.memberId || 'anonymous',
        userName: loginState.nickname || '익명' // Use actual nickname, fallback to '익명'
      };
      
      console.log('=== 제출 데이터 확인 ===');
      console.log('isEditing:', isEditing);
      console.log('formData:', formData);
      console.log('userInfo:', userInfo);
      console.log('게시글 ID:', id);
      
      if (isEditing) {
        console.log('수정 API 호출 중...');
        await updateNotice(id, formData, userInfo);
        setSnackbar({ open: true, message: '게시글이 성공적으로 수정되었습니다.', severity: 'success' });
      } else {
        console.log('생성 API 호출 중...');
        await createNotice(formData, userInfo);
        setSnackbar({ open: true, message: '새 게시글이 성공적으로 작성되었습니다.', severity: 'success' });
      }
      
      // 성공 메시지 표시 후 1.5초 뒤 목록으로 이동
      setTimeout(() => {
        navigate('/noboard');
      }, 1500);
    } catch (error) {
      console.error('저장 실패:', error);
      setSnackbar({ open: true, message: `오류가 발생했습니다: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성을 취소하시겠습니까? 입력한 내용이 사라집니다.')) {
      navigate('/noboard');
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main',
          py: 4,
          px: 3
        }}
      >
        <Container maxWidth="md">
          <Button
            variant="text"
            onClick={() => navigate('/noboard')}
            startIcon={<ArrowLeftIcon />}
            sx={{ 
              mb: 2,
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            목록으로
          </Button>
          
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              color: 'primary.contrastText',
              fontWeight: 'bold'
            }}
          >
            {isEditing ? '게시글 수정' : '새 게시글 작성'}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ boxShadow: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Title */}
                <TextField
                  label="제목"
                  fullWidth
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  placeholder="게시글 제목을 입력하세요"
                  required
                  disabled={loading}
                />

                

                {/* Content */}
                <TextField
                  label="내용"
                  multiline
                  rows={12}
                  fullWidth
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  error={!!errors.content}
                  helperText={errors.content}
                  placeholder="게시글 내용을 입력하세요"
                  required
                  disabled={loading}
                  sx={{
                    '& .MuiInputBase-root': {
                      alignItems: 'flex-start'
                    }
                  }}
                />

                {/* Action Buttons */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pt: 2
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    startIcon={<ArrowLeftIcon />}
                    disabled={loading}
                    size="large"
                  >
                    취소
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                    size="large"
                  >
                    {loading ? '저장 중...' : (isEditing ? '수정하기' : '작성하기')}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WritePost;