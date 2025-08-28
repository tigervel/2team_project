import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Avatar, Box, Button, Divider, Grid, IconButton, InputAdornment,
  TextField, Typography
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// 공통 axios 인스턴스 (JWT 자동 첨부)
const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const EditMyInform = () => {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // 'MEMBER' | 'CARGO_OWNER'
  const [userType, setUserType] = useState(null);

  // 화면에서 쓰는 공통 스키마
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    createdDate: '',
    postcode: '',
  });

  const [pwd, setPwd] = useState({
    current: '',
    next: '',
    confirm: '',
  });

  const [loading, setLoading] = useState(true);

  // --- Daum postcode ---
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

  const openPostcode = useCallback(async () => {
    try {
      await loadDaumPostcode();
      new window.daum.Postcode({
        oncomplete: (data) => {
          const road = data.roadAddress || data.address;
          const zonecode = data.zonecode || '';
          setUser(prev => ({ ...prev, address: road, postcode: zonecode }));
        },
      }).open();
    } catch (e) {
      console.error(e);
      alert('주소 검색 로딩에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }, [loadDaumPostcode]);

  // --- 초기 로드: 로그인 주체 조회 -> 공통 스키마로 매핑 ---
  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        const res = await api.get('/g2i4/user/info');
        // 기대 응답:
        // { userType: 'MEMBER' | 'CARGO_OWNER', data: {...row} }
        const { userType: type, data } = res.data || {};
        if (!type || !data) throw new Error('Malformed /g2i4/user/info response');

        // 테이블 별 → 공통 스키마 매핑
        // member:  mem_id,  mem_name,  mem_email,  mem_phone,  mem_address,  mem_create_id_date_time
        // cargo:   cargo_id,cargo_name,cargo_email,cargo_phone,cargo_address,cargo_created_date_time
        const normalized = (type === 'MEMBER')
          ? {
              id: data.mem_id ?? '',
              name: data.mem_name ?? '',
              email: data.mem_email ?? '',
              phone: data.mem_phone ?? '',
              address: data.mem_address ?? '',
              createdDate: data.mem_create_id_date_time ?? '',
            }
          : {
              id: data.cargo_id ?? '',
              name: data.cargo_name ?? '',
              email: data.cargo_email ?? '',
              phone: data.cargo_phone ?? '',
              address: data.cargo_address ?? '',
              createdDate: data.cargo_created_date_time ?? data.cargo_created_datetime ?? '',
            };

        if (!canceled) {
          setUserType(type);
          setUser(prev => ({ ...prev, ...normalized }));
        }
      } catch (err) {
        console.error('회원 정보 불러오기 실패:', err);
        alert('회원 정보를 불러오지 못했습니다.');
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => { canceled = true; };
  }, []);

  // --- 주소 변경 저장 ---
  const handleSaveAddress = async () => {
    try {
      if (!userType) return;

      // 백엔드 라우팅 규칙: 필요에 맞춰 경로만 맞춰줘
      // 통일 엔드포인트가 있으면 그걸로 바꿔도 됨.
      const url = (userType === 'MEMBER')
        ? `/g2i4/member/${encodeURIComponent(user.id)}/address`
        : `/g2i4/cargo/${encodeURIComponent(user.id)}/address`;

      const payload = {
        address: user.address,
        postcode: user.postcode || null,
      };

      await api.put(url, payload);
      alert('주소가 변경되었습니다.');
    } catch (e) {
      console.error(e);
      alert('주소 변경에 실패했습니다.');
    }
  };

  // --- 비밀번호 변경 저장 ---
  const handleChangePassword = async () => {
    try {
      if (!userType) return;
      if (!pwd.current || !pwd.next || !pwd.confirm) {
        alert('비밀번호를 모두 입력하세요.');
        return;
      }
      if (pwd.next !== pwd.confirm) {
        alert('새 비밀번호가 일치하지 않습니다.');
        return;
      }

      const url = (userType === 'MEMBER')
        ? `/g2i4/member/${encodeURIComponent(user.id)}/password`
        : `/g2i4/cargo/${encodeURIComponent(user.id)}/password`;

      await api.put(url, {
        currentPassword: pwd.current,
        newPassword: pwd.next,
      });

      alert('비밀번호가 변경되었습니다.');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (e) {
      console.error(e);
      alert('비밀번호 변경에 실패했습니다.');
    }
  };

  if (loading) {
    return <Box sx={{ p: 7 }}>불러오는 중…</Box>;
  }

  return (
    <Box sx={{ p: 7, paddingLeft: 50, paddingRight: 50, bgcolor: '#f3f4f6', minHeight: '100vh' }}>
      <Typography variant="h5" fontWeight="bold" mb={1}>회원 정보 수정</Typography>
      <Typography variant="body2" sx={{ color: 'gray', mb: 4 }}>
        로그인 유형: {userType === 'MEMBER' ? '일반 회원' : '화물(차량) 소유자'}
      </Typography>

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

      {/* 주소 변경 */}
      <Typography fontWeight="bold" mb={2}>주소 변경</Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" gap={2}>
          <TextField
            label="주소"
            fullWidth
            value={user.address || ''}
            onClick={openPostcode}
            InputProps={{
              readOnly: true,
              sx: { bgcolor: '#f3f4f6', cursor: 'pointer' }
            }}
          />
          <Button
            variant="outlined"
            sx={{ width: 200, whiteSpace: 'nowrap' }}
            onClick={openPostcode}
          >
            주소 찾기
          </Button>
        </Box>

        <Box textAlign="right">
          <Button
            variant="contained"
            sx={{ width: 157, height: 50, bgcolor: '#6b46c1', '&:hover': { bgcolor: '#553c9a' } }}
            onClick={handleSaveAddress}
          >
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
          value={pwd.current}
          onChange={(e) => setPwd(p => ({ ...p, current: e.target.value }))}
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
          value={pwd.next}
          onChange={(e) => setPwd(p => ({ ...p, next: e.target.value }))}
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
          value={pwd.confirm}
          onChange={(e) => setPwd(p => ({ ...p, confirm: e.target.value }))}
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
          <Button
            variant="contained"
            sx={{ width: 157, height: 50, bgcolor: '#6b46c1', '&:hover': { bgcolor: '#553c9a' } }}
            onClick={handleChangePassword}
          >
            변경하기
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditMyInform;
