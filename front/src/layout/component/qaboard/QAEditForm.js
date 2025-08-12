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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const QAEditForm = ({ item, categories, onSave, onCancel, isVisible }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    isPrivate: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item && isVisible) {
      setFormData({
        title: item.title || '',
        content: item.content || '',
        category: item.category || '',
        isPrivate: item.isPrivate || false
      });
    }
  }, [item, isVisible]);

  if (!isVisible) return null;

  const handleChange = (field) => (event) => {
    const value = field === 'isPrivate' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    if (!formData.category) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const updatedItem = {
        ...item,
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        isPrivate: formData.isPrivate,
        lastModified: new Date().toISOString().split('T')[0]
      };
      
      console.log('QAEditForm - Calling onSave with:', updatedItem);
      await onSave(updatedItem);
    } catch (err) {
      setError('수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: item?.title || '',
      content: item?.content || '',
      category: item?.category || '',
      isPrivate: item?.isPrivate || false
    });
    setError('');
    onCancel();
  };

  return (
    <Card sx={{ mt: 2, border: '2px solid #2196f3', backgroundColor: '#f3f8ff' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
          게시글 수정
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

            <FormControl fullWidth required>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={formData.category}
                label="카테고리"
                onChange={handleChange('category')}
                disabled={isSubmitting}
              >
                {categories?.filter(c => c.id !== 'all').map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isPrivate}
                  onChange={handleChange('isPrivate')}
                  disabled={isSubmitting}
                />
              }
              label="비공개 문의"
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

export default QAEditForm;