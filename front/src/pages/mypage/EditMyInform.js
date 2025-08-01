import React, { useState } from 'react';
import {
  Avatar, Box, Button, Divider, Grid, IconButton, InputAdornment,
  TextField, Typography
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const MemberEditPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f3f4f6', minHeight: '100vh' }}>
      <Typography variant="h5" fontWeight="bold" mb={4}>회원 정보 수정</Typography>

      {/* Profile Section */}
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography fontWeight="bold" mb={2}>Profile Photo</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'grey.200' }} />
            <Box>
              <Button variant="outlined" sx={{ mb: 1 }}>사진 업로드</Button>
              <Typography variant="body2" sx={{ color: 'gray', textAlign: 'center' }}>사진 삭제</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography>ID :</Typography>
          <Typography>Email :</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* User Details Section */}
      <Typography fontWeight="bold" mb={2}>User Details</Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField label="닉네임" fullWidth defaultValue="current_nickname" InputProps={{ sx: { bgcolor: '#f3f4f6' } }} />

        <TextField label="주소" fullWidth defaultValue="current_address" InputProps={{ sx: { bgcolor: '#f3f4f6' } }} />

        <Box display="flex" gap={2}>
          <TextField label="상세 주소" fullWidth defaultValue="current_address" InputProps={{ sx: { bgcolor: '#f3f4f6' } }} />
          <Button variant="outlined" sx={{ whiteSpace: 'nowrap' }}>주소 찾기</Button>
        </Box>

        <Box textAlign="right">
          <Button variant="contained" sx={{ bgcolor: '#6b46c1', '&:hover': { bgcolor: '#553c9a' } }}>변경하기</Button>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Password Section */}
      <Typography fontWeight="bold" mb={2}>비밀번호 변경</Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="현재 비밀번호"
          fullWidth
          type={showPassword ? 'text' : 'password'}
          placeholder="Placeholder"
          InputProps={{
            sx: { bgcolor: '#f3f4f6' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={togglePasswordVisibility} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <TextField
          label="새로운 비밀번호"
          fullWidth
          type={showPassword ? 'text' : 'password'}
          placeholder="Placeholder"
          InputProps={{
            sx: { bgcolor: '#f3f4f6' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={togglePasswordVisibility} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <TextField
          label="새로운 비밀번호 확인"
          fullWidth
          type={showPassword ? 'text' : 'password'}
          placeholder="Placeholder"
          InputProps={{
            sx: { bgcolor: '#f3f4f6' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={togglePasswordVisibility} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Box textAlign="right">
          <Button variant="contained" sx={{ bgcolor: '#6b46c1', '&:hover': { bgcolor: '#553c9a' } }}>변경하기</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MemberEditPage;
