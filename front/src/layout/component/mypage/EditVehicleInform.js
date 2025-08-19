import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Grid, Paper, Typography, Button, Modal, TextField, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const cargoId = 'cargo123';

const EditVehicleInform = () => {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    no: null,
    name: '',
    address: '',
    weight: '',
    image: null,
    preview: null
  });

  // 차량 목록 불러오기
  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/g2i4/cargo/list/${cargoId}`);
      const data = res.data.map(cargo => ({
        no: cargo.cargoNo,
        name: cargo.cargoName,
        address: cargo.cargoType,
        weight: cargo.cargoCapacity,
        imagePath: cargo.cargoImage,
        preview: cargo.cargoImage ? `http://localhost:8080${cargo.cargoImage}` : null
      }));
      setVehicles(data);
    } catch (err) {
      console.error('차량 목록 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpen = (index = null) => {
    setEditingIndex(index);
    if (index !== null) {
      setFormData(vehicles[index]);
    } else {
      setFormData({
        no: null, name: '', address: '', weight: '', image: null, preview: null
      });
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        preview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSave = async () => {
    const { no, name, address, weight, image } = formData;

    if (!name || !address || !weight) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    try {
      let cargoNo = no;

      if (no != null) {
        const res = await axios.put(`http://localhost:8080/g2i4/cargo/update/${no}`, {
          name, address, weight
        });
        cargoNo = res.data.cargoNo;
      } else {
        const res = await axios.post(`http://localhost:8080/g2i4/cargo/add/${cargoId}`, {
          name, address, weight
        });
        cargoNo = res.data.cargoNo;
      }

      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        const cleanCargoNo = String(cargoNo).trim();
        const res = await axios.post(`http://localhost:8080/g2i4/cargo/upload/${cleanCargoNo}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      await fetchVehicles();
      handleClose();
    } catch (err) {
      console.error('차량 저장 실패:', err);
      alert('차량 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (index) => {
    const target = vehicles[index];
    if (!target || !target.no) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`http://localhost:8080/g2i4/cargo/delete/${target.no}`);
      await fetchVehicles();
    } catch (err) {
      console.error('차량 삭제 실패:', err);
      alert('삭제 실패');
    }
  };

  return (
    <Box sx={{ p: 7, bgcolor: '#f3f4f6', minHeight: '100vh' }}>
      <Typography variant="h5" fontWeight="bold" mb={4}>내 차량 관리</Typography>

      <Grid container spacing={4}>
        {vehicles.map((vehicle, idx) => (
          <Grid item key={idx}>
            <Paper sx={{ width: 400, height: 400, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{
                height: 250, bgcolor: '#e5e7eb', borderRadius: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <img
                  src={vehicle.preview || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="310"><rect width="100%" height="100%" fill="%23d1d5db"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="24" font-family="sans-serif">No Image</text></svg>'}
                  alt="preview"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontWeight="bold">{vehicle.name}</Typography>
                <Typography>{vehicle.address}</Typography>
                <Typography>{vehicle.weight}kg</Typography>
              </Box>
              <Box mt={2} display="flex" gap={1}>
                <Button fullWidth variant="contained" onClick={() => handleOpen(idx)}>수정</Button>
                <Button fullWidth variant="contained" color="error" onClick={() => handleDelete(idx)}>삭제</Button>
              </Box>
            </Paper>
          </Grid>
        ))}

        <Grid item>
          <Paper onClick={() => handleOpen()} sx={{
            width: 400, height: 400, border: '2px dashed #ccc', borderRadius: 2,
            display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer'
          }}>
            <Typography variant="h4">＋</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          p: 4, bgcolor: '#fff', borderRadius: 2, width: '90%', maxWidth: 1000, mx: 'auto', mt: '5%', position: 'relative'
        }}>
          <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 12, right: 12 }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" mb={3}>차량 정보 입력</Typography>
          <Box display="flex" gap={4} flexDirection={{ xs: 'column', md: 'row' }}>
            <Box sx={{ flex: 1, bgcolor: '#e5e7eb', aspectRatio: '5/3', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
              <img
                src={formData.preview ||  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300"><rect width="100%" height="100%" fill="%23d1d5db"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="24" font-family="sans-serif">No Image</text></svg>'}
                alt="preview"
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Box flex={1} display="flex" flexDirection="column" gap={2}>
              <TextField label="차량 이름" value={formData.name} onChange={handleChange('name')} fullWidth />
              <TextField label="차량 종류" value={formData.address} onChange={handleChange('address')} fullWidth />
              <TextField label="적재 무게(kg)" value={formData.weight} onChange={handleChange('weight')} fullWidth />
              <Button variant="outlined" component="label" >
                이미지 업로드
                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
              </Button>
            </Box>
          </Box>
          <Box mt={4} display="flex" gap={2}>
            <Button fullWidth variant="contained" onClick={handleSave}>저장</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default EditVehicleInform;