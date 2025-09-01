// Sidebar.js
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
  const loginState = useSelector(state => state.login);
  const isOwner = loginState?.roles?.includes('CARGO_OWNER');
  const cargoId = loginState?.memberId; // Assuming memberId is the cargoId for owners
  const avatarUrl = loginState?.profileImage;

 

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
          }}
          alt="프로필"
        />
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
