// Sidebar.js
import React, { useEffect, useState } from 'react';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, Box
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import axios from 'axios';

const drawerWidth = 240;

// 백엔드 베이스 URL
const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

const DEFAULT_AVATAR = '/image/placeholders/avatar.svg';

// 파일명/웹경로 모두 처리
const normalizeProfileUrl = (v) => {
  if (!v) return null;
  if (v.startsWith('http')) return v;
  if (v.startsWith('/g2i4/uploads/')) return `${API_BASE}${v}`;
  // 파일명만 온 경우
  return `${API_BASE}/g2i4/uploads/user_profile/${encodeURIComponent(v)}`;
};

// 토큰 집계
const pickToken = () =>
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('accessToken') ||
  localStorage.getItem('ACCESS_TOKEN') ||
  sessionStorage.getItem('ACCESS_TOKEN') ||
  null;

const Sidebar = ({ ownerId }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = pickToken();
        const { data: raw } = await axios.get(`${API_BASE}/g2i4/user/info`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data =
          raw?.data || raw?.user || raw?.payload || raw?.profile || raw?.account || raw?.result || {};

        // 서버가 어떤 키로 주든 커버(webPath 우선)
        const nameOrWebPath =
          data.webPath ||
          data.profileImage ||
          data.mem_profile_image ||
          data.cargo_profile_image ||
          data.profile ||
          '';

        const url = normalizeProfileUrl(nameOrWebPath);
        if (!cancelled) setAvatarUrl(url);
      } catch {
        // 실패 시 폴백 아이콘 사용
        if (!cancelled) setAvatarUrl(null);
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
          top: '79px', // AppBar 높이
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
            onError: () => setAvatarUrl(null), // 이미지 깨지면 아이콘 폴백
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
            <ListItem button sx={isActive ? activeStyle : null}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="내 정보" />
            </ListItem>
          )}
        </NavLink>

        <NavLink to="/mypage/delivery" style={navStyle}>
          {({ isActive }) => (
            <ListItem button sx={isActive ? activeStyle : null}>
              <ListItemIcon><DescriptionIcon /></ListItemIcon>
              <ListItemText primary="배송 정보 관리" />
            </ListItem>
          )}
        </NavLink>

        <NavLink to="/mypage/edit" style={navStyle}>
          {({ isActive }) => (
            <ListItem button sx={isActive ? activeStyle : null}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="회원 정보 수정" />
            </ListItem>
          )}
        </NavLink>

        {ownerId !== null && (
          <NavLink to="/mypage/vehicle" style={navStyle}>
            {({ isActive }) => (
              <ListItem button sx={isActive ? activeStyle : null}>
                <ListItemIcon><BuildIcon /></ListItemIcon>
                <ListItemText primary="내 차량 관리" />
              </ListItem>
            )}
          </NavLink>
        )}
      </List>
    </Drawer>
  );
};

export default Sidebar;
