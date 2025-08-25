import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Stack,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const NoticeEditForm = ({ item, onSave, onCancel, isVisible }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item && isVisible) {
      setFormData({
        title: item.title || '',
        content: item.content || '',
      });
    }
  }, [item, isVisible]);

  if (!isVisible) return null;

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (formData.title.trim().length > 200) {
      setError('제목은 200자 이내로 입력해주세요.');
      return;
    }
    if (!formData.content || !formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const updatedItem = {
        ...item,
        title: formData.title.trim(),
        content: formData.content.trim(),
      };
      
      await onSave(updatedItem);
    } catch (err) {
      console.error('NoticeEditForm - 수정 중 오류:', err);
      setError(`수정 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: item?.title || '',
      content: item?.content || '',
    });
    setError('');
    onCancel();
  };

  return (
    <Card sx={{ mt: 2, border: '2px solid #2196f3', backgroundColor: '#f3f8ff' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
          공지사항 수정
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="제목"
              value={formData.title}
              onChange={handleChange('title')}
              variant="outlined"
              disabled={isSubmitting}
              required
            />

            <TextField
              fullWidth
              label="내용"
              multiline
              rows={4}
              value={formData.content}
              onChange={handleChange('content')}
              variant="outlined"
              disabled={isSubmitting}
              required
              placeholder="수정할 내용을 입력해주세요"
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                type="button"
                variant="outlined"
                onClick={handleCancel}
                disabled={isSubmitting}
                startIcon={<CancelIcon />}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={<SaveIcon />}
              >
                {isSubmitting ? '수정 중...' : '수정 완료'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

export default NoticeEditForm;