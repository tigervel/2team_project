import React, { useEffect, useState, useCallback } from 'react';
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
    addressDetail: '',
    postcode: '',
    createdDate: '',
  });

  // daum postcode 스크립트 동적 로더
  const loadDaumPostcode = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.daum && window.daum.Postcode) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Daum Postcode script load failed'));
      document.body.appendChild(script);
    });
  }, []);

  // 주소검색 팝업 열기
  const openPostcode = useCallback(async () => {
    try {
      await loadDaumPostcode();
      new window.daum.Postcode({
        oncomplete: (data) => {
          const road = data.roadAddress || data.address; // 도로명 우선, 없으면 지번
          const zonecode = data.zonecode || '';
          setUser(prev => ({ ...prev, address: road, postcode: zonecode }));
        },
      }).open();
    } catch (e) {
      console.error(e);
      alert('주소 검색 로딩에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }, [loadDaumPostcode]);

  useEffect(() => {
    axios.get('/g2i4/user/info')
      .then(res => {
        setUserType(res.data.userType);
        setUser(prev => ({ ...prev, ...res.data.data })); // 서버 DTO 반영
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
        <TextField
          label="닉네임"
          fullWidth
          defaultValue={user.name}
          InputProps={{ sx: { bgcolor: '#f3f4f6' } }}
        />

        {/* 주소 + 버튼 */}
        <Box display="flex" gap={2}>
          <TextField
            label="주소"
            fullWidth
            value={user.address || ''}
            // 클릭 시 팝업
            onClick={openPostcode}                     
            //직접 타이핑 대신 검색만
            InputProps={{
              readOnly: true,                         
              sx: { bgcolor: '#f3f4f6', cursor: 'pointer' }
            }}
          />
          
          <Button
          //버튼으로도 팝업
            variant="outlined"
            sx={{ width: 200, whiteSpace: 'nowrap' }}
            onClick={openPostcode}                      
          >
            주소 찾기
          </Button>
        </Box>

        {/* 우편번호(선택) */}
        <TextField
          label="우편번호"
          fullWidth
          value={user.postcode || ''}
          InputProps={{ sx: { bgcolor: '#f3f4f6' } }}
          onChange={(e) => setUser(prev => ({ ...prev, postcode: e.target.value }))}
        />

        <TextField
          label="상세 주소"
          fullWidth
          value={user.addressDetail || ''}
          InputProps={{ sx: { bgcolor: '#f3f4f6' } }}
          onChange={(e) => setUser(prev => ({ ...prev, addressDetail: e.target.value }))}
        />

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
