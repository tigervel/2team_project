import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Avatar, Box, Button, Divider, Grid, IconButton, InputAdornment,
  TextField, Typography
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const MemberEditPage = () => {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const [userType, setUserType] = useState(null); // 'MEMBER' or 'CARGO_OWNER'
  const [user, setUser] = useState({
    id: 'cargo123',
    name: '',
    email: '',
    phone: '',
    address: '',
    createdDate: '',
  });

  useEffect(() => {
    axios.get('/g2i4/user/info')
      .then(res => {
        setUserType(res.data.userType);
        setUser(res.data.data); // 서버에서 내려온 user DTO 형태로 세팅
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
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'grey.200' }} />
            <Box>
              <Button variant="outlined" sx={{ mb: 1 }}>사진 업로드</Button>
              <Typography variant="body2" sx={{ color: 'gray', textAlign: 'center' }}>사진 삭제</Typography>
            </Box>
          </Box>
        </Grid>

        {/* Divider */}
        <Grid item md={0.1} sx={{
          display: { xs: 'none', md: 'block' },
          height: '100%',
          borderLeft: '1px solid #666666'
        }} />

        {/* Info */}
        <Grid item xs={12} md={5.9}>
          <Box sx={{ pl: { md: 4 } }}>
            <Typography fontWeight="bold" mb={2}>회원 정보</Typography>
            <Typography>이 름 : {user.name}</Typography><br />
            <Typography>아이디 : {user.id}</Typography><br />
            <Typography>이메일 : {user.email}</Typography>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* 기본 정보 변경 */}
      <Typography fontWeight="bold" mb={2}>기본 정보 변경</Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField label="닉네임" fullWidth defaultValue={user.name} InputProps={{ sx: { bgcolor: '#f3f4f6' } }} />

        <Box display="flex" gap={2}>
          <TextField
            label="주소"
            fullWidth
            value={user.address}
            InputProps={{ sx: { bgcolor: '#f3f4f6' } }}
            onChange={(e) => setUser(prev => ({ ...prev, address: e.target.value }))}
          />
          <Button variant="outlined" sx={{ width: 200, whiteSpace: 'nowrap' }}>주소 찾기</Button>
        </Box>

        <TextField label="상세 주소" fullWidth defaultValue="current_address" InputProps={{ sx: { bgcolor: '#f3f4f6' } }} />

        <Box textAlign="right">
          <Button variant="contained" sx={{ width: 175, height: 50, bgcolor: '#6b46c1', '&:hover': { bgcolor: '#553c9a' } }}>
            변경하기
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* 비밀번호 변경 */}
      <Typography fontWeight="bold" mb={2}>비밀번호 변경</Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="현재 비밀번호"
          fullWidth
          type={showPassword.current ? 'text' : 'password'}
          InputProps={{
            sx: { bgcolor: '#f3f4f6' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => togglePasswordVisibility('current')} edge="end">
                  {showPassword.current ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <TextField
          label="새로운 비밀번호"
          fullWidth
          type={showPassword.new ? 'text' : 'password'}
          InputProps={{
            sx: { bgcolor: '#f3f4f6' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => togglePasswordVisibility('new')} edge="end">
                  {showPassword.new ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <TextField
          label="새로운 비밀번호 확인"
          fullWidth
          type={showPassword.confirm ? 'text' : 'password'}
          InputProps={{
            sx: { bgcolor: '#f3f4f6' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => togglePasswordVisibility('confirm')} edge="end">
                  {showPassword.confirm ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Box textAlign="right">
          <Button variant="contained" sx={{ width: 175, height: 50, bgcolor: '#6b46c1', '&:hover': { bgcolor: '#553c9a' } }}>
            변경하기
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MemberEditPage;