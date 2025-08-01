import React, { useState } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Modal, TextField, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const EditVehicleInform = () => {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '', weight: '' });

  const handleOpen = (index = null) => {
    setEditingIndex(index);
    if (index !== null) {
      setFormData(vehicles[index]);
    } else {
      setFormData({ name: '', address: '', weight: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingIndex(null);
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    const { name, address, weight } = formData;
    if (!name || !address || !weight) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const updatedVehicles = [...vehicles];
    if (editingIndex !== null) {
      updatedVehicles[editingIndex] = formData;
    } else {
      updatedVehicles.push(formData);
    }
    setVehicles(updatedVehicles);
    handleClose();
  };

  const handleDelete = (index) => {
    const updatedVehicles = vehicles.filter((_, i) => i !== index);
    setVehicles(updatedVehicles);
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f3f4f6', minHeight: '100vh' }}>
      <Typography variant="h5" fontWeight="bold" mb={4}>내 차량 관리</Typography>

      <Box mb={4}>
        <Paper sx={{ display: 'inline-block', p: 2, borderRadius: 2, boxShadow: 1, width:'150px'}}>
          <Typography variant="body2" color="text.secondary">내 차량 수</Typography>
          <Typography variant="h6" fontWeight="bold">{vehicles.length}건</Typography>
        </Paper>
      </Box>

      
    <Grid container spacing={4} justifyContent="flex-start">
  {vehicles.map((vehicle, idx) => (
    <Grid item key={idx}>
      <Paper
        sx={{
          width: 300,
          height: 300,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        {/* 이미지 */}
        <Box
          sx={{
            width: '100%',
            height: 200,
            bgcolor: '#e5e7eb',
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <img
            src={vehicle.preview || '/camera-icon.png'}
            alt="preview"
            style={{ width: 64, height: 64, opacity: 0.5 }}
          />
        </Box>

        {/* 텍스트 */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography fontWeight="bold">{vehicle.name}</Typography>
          <Typography variant="body2">{vehicle.address}</Typography>
          <Typography variant="body2">{vehicle.weight}</Typography>
        </Box>

        {/* 버튼 */}
        <Box mt={2} display="flex" gap={1} width="100%">
          <Button fullWidth size="small" variant="contained" onClick={() => handleOpen(idx)}>
            수정하기
          </Button>
          <Button
            fullWidth
            size="small"
            variant="contained"
            color="secondary"
            onClick={() => handleDelete(idx)}
          >
            삭제하기
          </Button>
        </Box>
      </Paper>
    </Grid>
  ))}

  {/* 추가 카드 */}
  <Grid item>
    <Paper
      onClick={() => handleOpen()}
      sx={{
        width: 300,
        height: 300,
        border: '2px dashed #ccc',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        '&:hover': { bgcolor: '#fafafa' },
      }}
    >
      <Typography fontSize={40}>＋</Typography>
      <Typography fontSize={16} mt={1}>
        클릭해서 차량 추가
      </Typography>
    </Paper>
  </Grid>
</Grid>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'relative',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: '90%',
            maxWidth: '1000px',
            mx: 'auto',
            mt: '5%',
          }}
        >
          <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 12, right: 12 }}>
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" fontWeight="bold" mb={4}>내 차량 관리</Typography>

          <Box display="flex" gap={4} flexDirection={{ xs: 'column', md: 'row' }}>
            <Box
              sx={{
                flex: 1,
                aspectRatio: '5/3',
                bgcolor: '#e5e7eb',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src={formData.preview || '/camera-icon.png'}
                alt="preview"
                style={{ opacity: 0.5, objectFit: 'contain' }}
              />
            </Box>

            <Box flex={1} display="flex" flexDirection="column" gap={3}>
              <TextField label="차량 이름" fullWidth value={formData.name} onChange={handleChange('name')} InputProps={{ sx: { bgcolor: '#f3f4f6' } }} />
              <TextField label="종류" fullWidth value={formData.address} onChange={handleChange('address')} InputProps={{ sx: { bgcolor: '#f3f4f6' } }} />
              <TextField label="적재 무게" fullWidth value={formData.weight} onChange={handleChange('weight')} InputProps={{ sx: { bgcolor: '#f3f4f6' } }} />
            </Box>
          </Box>

          <Box display="flex" gap={3} mt={4}>
            <Button variant="contained" sx={{ flex: 1, py: 2, fontSize: 16, bgcolor: '#a855f7', '&:hover': { bgcolor: '#9333ea' } }}>사진 업로드</Button>
            <Button variant="contained" sx={{ flex: 1, py: 2, fontSize: 16, bgcolor: '#a855f7', '&:hover': { bgcolor: '#9333ea' } }} onClick={handleSave}>확인</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default EditVehicleInform;
