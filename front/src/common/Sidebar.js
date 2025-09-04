import React, { useEffect, useState } from 'react';
import {
  Drawer, List, ListItemIcon, ListItemText, ListItemButton,
  Typography, Avatar, Divider, Box, Skeleton
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import axios from 'axios';

const drawerWidth = 240;
const APPBAR_HEIGHT_MOBILE = 56;
const APPBAR_HEIGHT_DESKTOP = 100;

const DEBUG_SIDEBAR = false;

// === API 베이스 ===
const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

// 절대 실패 안 하는 인라인 폴백(회색만 남는 문제 방지)
const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
    <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#e0e0e0"/><stop offset="1" stop-color="#cfcfcf"/></linearGradient></defs>
    <circle cx="40" cy="40" r="40" fill="url(#g)"/>
    <circle cx="40" cy="32" r="14" fill="#fff" fill-opacity=".7"/>
    <path d="M10 70c6-12 18-20 30-20s24 8 30 20" fill="#fff" fill-opacity=".7"/>
  </svg>`);

const normalizeProfileUrl = (v) => {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('/g2i4/uploads/')) return `${API_BASE}${s}`;
  const fname = encodeURIComponent(s.replace(/^\/+/, ''));
  return `${API_BASE}/g2i4/uploads/user_profile/${fname}`;
};

const pickToken = () =>
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('accessToken') ||
  localStorage.getItem('ACCESS_TOKEN') ||
  sessionStorage.getItem('ACCESS_TOKEN') ||
  null;

// === 사이드바 전용 캐시 키 ===
const CACHE_KEY = 'sidebar.userinfo.cache';

// === 중복 호출 방지(단일 비행)용 모듈 스코프 프라미스 ===
let inflight = null;

const Sidebar = () => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [cargoId, setCargoId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1) 즉시: 로컬 캐시를 읽어 화면을 채움(0ms)
  useEffect(() => {
    const cached = (() => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

    if (cached) {
      const urlBase = normalizeProfileUrl(cached.profileImage || cached.webPath);
      const bust = cached.updatedAt ? `?v=${encodeURIComponent(cached.updatedAt)}` : '';
      const url = urlBase ? urlBase + bust : null;
      setAvatarUrl(url);
      setCargoId(cached.cargoId ?? null);
      setIsOwner(cached.userType === 'CARGO_OWNER');
      setLoading(false); // 캐시로 바로 화면 보이기
    }
  }, []);

  // 2) 백그라운드 최신화(SWR) + 단일비행 + 취소 + 살짝 지연(메인 페인트 먼저)
  useEffect(() => {
    const token = pickToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      // 이미 같은 요청이 돌고 있으면 합류
      if (!inflight) {
        inflight = (async () => {
          // 150ms 지연: 초기 페인트 방해 줄이기
          await new Promise((r) => setTimeout(r, 150));
          const res = await fetch(`${API_BASE}/g2i4/user/info`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(`userinfo ${res.status}`);
          return res.json();
        })().finally(() => {
          // 완료/실패 후 다음 호출을 허용
          inflight = null;
        });
      }

      let raw;
      try {
        raw = await inflight;
      } catch (e) {
        if (DEBUG_SIDEBAR) console.warn('[Sidebar] userinfo fetch fail', e);
        setLoading(false);
        return;
      }

      const data =
        raw?.data || raw?.user || raw?.payload || raw?.profile || raw?.account || raw?.result || {};
      const nameOrWebPath =
        data.webPath ||
        data.profileImage ||
        data.mem_profile_image ||
        data.cargo_profile_image ||
        data.profile ||
        '';

      const urlBase = normalizeProfileUrl(nameOrWebPath);
      const updatedAt = data.updatedAt || Date.now();
      const url = urlBase ? `${urlBase}?v=${encodeURIComponent(updatedAt)}` : null;

      const userType = data.userType || data.type || raw?.userType || raw?.type || null;
      const cid =
        data.cargoId ?? data.ownerId ?? raw?.cargoId ?? raw?.ownerId ?? null;

      // 화면 갱신
      setAvatarUrl(url);
      setIsOwner(userType === 'CARGO_OWNER');
      setCargoId(cid);
      setLoading(false);

      // 로컬 캐시 저장(SWR용)
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            profileImage: nameOrWebPath,
            webPath: data.webPath,
            userType,
            cargoId: cid,
            updatedAt,
          })
        );
      } catch {}
    };

    run();
    return () => controller.abort();
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
          position: 'sticky',
          top: { xs: APPBAR_HEIGHT_MOBILE, md: APPBAR_HEIGHT_DESKTOP },
          alignSelf: 'flex-start',
        },
      }}

    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          마이페이지
        </Typography>

        {loading ? (
          <Skeleton variant="circular" width={56} height={56} />
        ) : (
          <Avatar
            sx={{ width: 56, height: 56, bgcolor: 'grey.200', color: 'grey.500' }}
            src={avatarUrl || DEFAULT_AVATAR}
            imgProps={{
              referrerPolicy: 'no-referrer',
              crossOrigin: 'anonymous',
              loading: 'lazy',
              onError: (e) => {
                if (DEBUG_SIDEBAR) console.warn('[Sidebar] avatar load error → fallback', e?.currentTarget?.src);
                e.currentTarget.src = DEFAULT_AVATAR;
              },
            }}
            alt="프로필"
          >
            <PersonIcon />
          </Avatar>
        )}
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
    </Drawer >
  );
};

export default Sidebar;
