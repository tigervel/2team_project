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

// === DEBUG 스위치 ===
const DEBUG_SIDEBAR = true;

// === API 베이스 ===
const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

const DEFAULT_AVATAR = '/image/placeholders/avatar.svg';

const normalizeProfileUrl = (v) => {
  if (!v) return null;
  if (String(v).startsWith('http')) return v;
  if (String(v).startsWith('/g2i4/uploads/')) return `${API_BASE}${v}`;
  return `${API_BASE}/g2i4/uploads/user_profile/${encodeURIComponent(v)}`;
};

const pickToken = () =>
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('accessToken') ||
  localStorage.getItem('ACCESS_TOKEN') ||
  sessionStorage.getItem('ACCESS_TOKEN') ||
  null;

const parseUserType = (raw) => {
  const t = raw?.userType || raw?.type || raw?.role || raw?.loginType || null;
  if (t === 'MEMBER' || t === 'CARGO_OWNER') return t;
  const data = raw?.data || raw?.user || raw?.payload || raw?.profile || raw?.account || raw?.result || {};
  const guess = data?.userType || data?.type || data?.role || data?.loginType || null;
  return (guess === 'MEMBER' || guess === 'CARGO_OWNER') ? guess : null;
};

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = pickToken();

      if (DEBUG_SIDEBAR) {
        console.groupCollapsed('%c[Sidebar:init] 요청 준비', 'color:#888');
        console.log('API_BASE =', API_BASE);
        console.log('token exists =', !!token, token ? `(prefix) ${String(token).slice(0, 12)}...` : '');
        console.groupEnd();
      }

      try {
        const { data: raw } = await axios.get(`${API_BASE}/g2i4/user/info`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data =
          raw?.data || raw?.user || raw?.payload || raw?.profile || raw?.account || raw?.result || {};
        const nameOrWebPath =
          data.webPath ||
          data.profileImage ||
          data.mem_profile_image ||
          data.cargo_profile_image ||
          data.profile ||
          '';

        const url = normalizeProfileUrl(nameOrWebPath);
        const type = parseUserType(raw);
        const cid = pickCargoId(raw);

        if (DEBUG_SIDEBAR) {
          console.groupCollapsed('%c[Sidebar:init] 응답 파싱', 'color:#4a8');
          console.log('raw =', raw);
          console.log('parsed userType =', type);
          console.log('picked cargoId  =', cid);
          console.log('profile name/webPath =', nameOrWebPath);
          console.log('normalized avatarUrl =', url);
          console.groupEnd();
        }

        if (!cancelled) {
          setAvatarUrl(url);
          setIsOwner(type === 'CARGO_OWNER');
          setCargoId(cid);
        }
      } catch (e) {
        if (DEBUG_SIDEBAR) {
          console.group('%c[Sidebar:init] 요청 실패', 'color:#c44');
          console.log('error =', e);
          console.log('status =', e?.response?.status);
          console.log('response.data =', e?.response?.data);
          console.groupEnd();
        }
        if (!cancelled) {
          setAvatarUrl(null);
          setIsOwner(false);
          setCargoId(null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 상태가 바뀔 때마다 표시조건도 함께 로그
  useEffect(() => {
    if (!DEBUG_SIDEBAR) return;
    console.groupCollapsed('%c[Sidebar:state] 변경됨', 'color:#888');
    console.table([{ isOwner, cargoId, showVehicleMenu: Boolean(isOwner && cargoId) }]);
    console.groupEnd();
  }, [isOwner, cargoId]);

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
            onError: () => {
              if (DEBUG_SIDEBAR) console.warn('[Sidebar] avatar load error → fallback');
              setAvatarUrl(null);
            },
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
          <NavLink
            to={`/mypage/vehicle/${cargoId}`}
            style={navStyle}
            onClick={() => {
              if (DEBUG_SIDEBAR) console.log('[Sidebar] 차량관리 클릭 cargoId =', cargoId);
            }}
          >
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
