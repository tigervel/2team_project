import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

  const [member, setMember] = useState({
    memId: '',
    memPw: '',
    memEmail: '',
    memName: '',
    memPhone: '',
    memAddress: '',
    memCreateIdDateTime: ''
  });
  
  useEffect(() => {
    axios.get('/api/member/info')
      .then(res => {
        setMember(res.data);
      })
      .catch(err => {
        console.error('회원 정보 불러오기 실패:', err);
      });
  }, []);


  return (
    <Box sx={{ p: 7, paddingLeft: 50, paddingRight: 50, bgcolor: '#f3f4f6', minHeight: '100vh' }}>
      <Typography variant="h5" fontWeight="bold" mb={4}>회원 정보 수정</Typography>

      {/* Profile Section */}
      <Grid container spacing={4} alignItems="center">
        {/* Profile Photo Section */}
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

        {/* Divider line between sections */}
        <Grid item md={0.1} sx={{
          display: { xs: 'none', md: 'block' },
          height: '100%',
          borderLeft: '1px solid #666666'
        }} />

        {/* User Info Section */}
        <Grid item xs={12} md={5.9}>
          <Box sx={{ pl: { md: 4 } }}>
            <Typography fontWeight="bold" mb={2}>회원 정보</Typography>
            <Typography>이 름 : {member.memName}</Typography><br />
            <Typography>아이디 : {member.memId}</Typography><br />
            <Typography>이메일 : {member.memEmail}</Typography>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* User Details Section */}
      <Typography fontWeight="bold" mb={2}>User Details</Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField label="닉네임" fullWidth defaultValue="current_nickname" InputProps={{ sx: { bgcolor: '#f3f4f6' } }} />



        <Box display="flex" gap={2}>
          <TextField
            label="주소"
            fullWidth
            value={member.memAddress}
            InputProps={{ sx: { bgcolor: '#f3f4f6' } }}
            onChange={(e) => setMember(prev => ({ ...prev, memAddress: e.target.value }))}
          />
          <Button variant="outlined" sx={{ width: 200, whiteSpace: 'nowrap' }}>주소 찾기</Button>
        </Box>
        <TextField label="상세 주소" fullWidth defaultValue="current_address" InputProps={{ sx: { bgcolor: '#f3f4f6' } }} />
        <Box textAlign="right">
          <Button variant="contained" sx={{ width: 175, height: 50, bgcolor: '#6b46c1', '&:hover': { bgcolor: '#553c9a' } }}>변경하기</Button>
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
                  {showPassword ? <Visibility /> : <VisibilityOff />}
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
                  {showPassword ? <Visibility /> : <VisibilityOff />}
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
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Box textAlign="right">
          <Button variant="contained" sx={{ width: 175, height: 50, bgcolor: '#6b46c1', '&:hover': { bgcolor: '#553c9a' } }}>변경하기</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MemberEditPage;
