// Sidebar.js
import React, { useEffect, useState } from 'react';
import {
  Drawer, List, ListItemIcon, ListItemText, ListItemButton,
  Typography, Avatar, Divider, Box
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import axios from 'axios';

const drawerWidth = 240;

const getToken = () =>
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('accessToken') ||
  localStorage.getItem('ACCESS_TOKEN') ||
  sessionStorage.getItem('ACCESS_TOKEN') || null;

const bust = (url) => (url ? `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}` : null);


// === API 베이스 ===
const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

const DEFAULT_AVATAR = '/image/placeholders/avatar.svg';

// 파일명/웹경로 모두 처리
const normalizeProfileUrl = (v) => {
  if (!v) return null;
  if (String(v).startsWith('http')) return v;
  if (String(v).startsWith('/g2i4/uploads/')) return `${API_BASE}${v}`;
  return `${API_BASE}/g2i4/uploads/user_profile/${encodeURIComponent(v)}`;
};

// 토큰 고르기
const pickToken = () =>
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('accessToken') ||
  localStorage.getItem('ACCESS_TOKEN') ||
  sessionStorage.getItem('ACCESS_TOKEN') ||
  null;

// 유저타입 파싱
const parseUserType = (raw) => {
  const t = raw?.userType || raw?.type || raw?.role || raw?.loginType || null;
  if (t === 'MEMBER' || t === 'CARGO_OWNER') return t;
  const data = raw?.data || raw?.user || raw?.payload || raw?.profile || raw?.account || raw?.result || {};
  const guess = data?.userType || data?.type || data?.role || data?.loginType || null;
  return (guess === 'MEMBER' || guess === 'CARGO_OWNER') ? guess : null;
};

// cargoId 추출 (백엔드 응답 형태 다양성 대응)
const pickCargoId = (raw) => {
  const sources = [
    raw?.cargoId, raw?.cargo_id, raw?.ownerId, raw?.cid,
    raw?.data?.cargoId, raw?.data?.cargo_id, raw?.result?.cargoId,
    raw?.profile?.cargoId, raw?.user?.cargoId,
  ];
  return sources.find(Boolean) ?? null;
};

const Sidebar = () => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [cargoId, setCargoId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

const getToken = () =>
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('accessToken') ||
  localStorage.getItem('ACCESS_TOKEN') ||
  sessionStorage.getItem('ACCESS_TOKEN') || null;

// 이미지 캐시 버스터
const bust = (url) => (url ? `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}` : null);

// useEffect 교체
useEffect(() => {
  let cancelled = false;

  const token = getToken();
  if (!token) {
    // 나중에 토큰이 생기면 다시 시도 (storage 이벤트 활용)
    const onStorage = (e) => {
      if (e.key === 'accessToken' || e.key === 'ACCESS_TOKEN') {
        const t = getToken();
        if (t && !cancelled) {
          // 다시 불러오기
          (async () => {
            try {
              const { data: raw } = await axios.get(`${API_BASE}/g2i4/user/info`, {
                headers: { Authorization: `Bearer ${t}` },
              });
              const data = raw?.data || raw?.user || raw?.payload || raw?.profile || raw?.account || raw?.result || {};
              const nameOrWebPath =
                data.webPath || data.profileImage || data.mem_profile_image || data.cargo_profile_image || data.profile || '';
              const url = normalizeProfileUrl(nameOrWebPath);
              setAvatarUrl(bust(url));
              setIsOwner(parseUserType(raw) === 'CARGO_OWNER');
              setCargoId(pickCargoId(raw));
            } catch {
              setAvatarUrl(null);
              setIsOwner(false);
              setCargoId(null);
            }
          })();
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => { cancelled = true; window.removeEventListener('storage', onStorage); };
  }

  // 토큰이 이미 있으면 즉시 호출
  (async () => {
    try {
      const { data: raw } = await axios.get(`${API_BASE}/g2i4/user/info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = raw?.data || raw?.user || raw?.payload || raw?.profile || raw?.account || raw?.result || {};
      const nameOrWebPath =
        data.webPath || data.profileImage || data.mem_profile_image || data.cargo_profile_image || data.profile || '';
      const url = normalizeProfileUrl(nameOrWebPath);
      if (!cancelled) {
        setAvatarUrl(bust(url));
        setIsOwner(parseUserType(raw) === 'CARGO_OWNER');
        setCargoId(pickCargoId(raw));
      }
    } catch {
      if (!cancelled) {
        setAvatarUrl(null);
        setIsOwner(false);
        setCargoId(null);
      }
    }
  })();

  return () => { cancelled = true; };
}, []); 

  const navStyle = { textDecoration: 'none', color: 'inherit' };
  const activeStyle = { backgroundColor: '#e0e0e0' };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: '79px',
          height: 'calc(100% - 79px)',
          position: 'fixed'
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          마이페이지
        </Typography>

        <Avatar
          sx={{ width: 56, height: 56, bgcolor: 'grey.200', color: 'grey.500' }}
          src={avatarUrl || DEFAULT_AVATAR}
          imgProps={{
            referrerPolicy: 'no-referrer',
            onError: () => setAvatarUrl(null),
          }}
          alt="프로필"
        >
          <PersonIcon />
        </Avatar>
      </Box>

      <Divider />

      <List>
        <NavLink to="/mypage" end style={navStyle}>
          {({ isActive }) => (
            <ListItemButton sx={isActive ? activeStyle : null}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="내 정보" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/mypage/delivery" style={navStyle}>
          {({ isActive }) => (
            <ListItemButton sx={isActive ? activeStyle : null}>
              <ListItemIcon><DescriptionIcon /></ListItemIcon>
              <ListItemText primary="배송 정보 관리" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/mypage/edit" style={navStyle}>
          {({ isActive }) => (
            <ListItemButton sx={isActive ? activeStyle : null}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="회원 정보 수정" />
            </ListItemButton>
          )}
        </NavLink>

        {/* 차주이고 cargoId가 있을 때만 노출 */}
        {isOwner && cargoId && (
          <NavLink to={`/mypage/vehicle/${cargoId}`} style={navStyle}>
            {({ isActive }) => (
              <ListItemButton sx={isActive ? activeStyle : null}>
                <ListItemIcon><BuildIcon /></ListItemIcon>
                <ListItemText primary="내 차량 관리" />
              </ListItemButton>
            )}
          </NavLink>
        )}
      </List>
    </Drawer>
  );
};

export default Sidebar;
