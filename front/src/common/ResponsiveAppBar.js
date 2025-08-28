// src/common/ResponsiveAppBar.js
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';

import { login as loginAction, logout as logoutAction } from '../slice/loginSlice';

// ✅ 백엔드 베이스 URL
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8080";

const pages = [
  { label: '견적서 작성', path: '/estimatepage' },
  { label: '운송 접수 사항', path: '/estimatepage/list' },
  { label: '고객지원', path: '/qaboard' },
  { label: '문의사항', path: '/qaboard' }
];

// 요청: settings 삭제하지 않기
const settings = [
  { label: '마이페이지', path: '/mypage' },
  { label: '주문내역 확인', path: '/mypage' },
  { label: '배송상태', path: '/mypage' },
  { label: '로그아웃', path: '/logout' }
];

// 간단한 JWT 디코더
function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function ResponsiveAppBar() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const loginState     = useSelector(state => state?.login);
  const hasReduxLogin  = Boolean(loginState?.email || loginState?.memberId);

  const accessToken = (typeof window !== 'undefined')
    ? localStorage.getItem('accessToken')
    : null;
  const hasToken = Boolean(accessToken);

  const isLogin = hasReduxLogin || hasToken;

  // ✅ 1) 앱 로드 시: accessToken 없고 refresh 쿠키만 있을 때 사일런트 리프레시
  React.useEffect(() => {
    if (hasReduxLogin || accessToken) return;

    let aborted = false;

    const tryParseAccessFromResponse = async (res) => {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        return data.accessToken || data.access || data.token || null;
      }
      const text = await res.text();
      try {
        const j = JSON.parse(text);
        return j.accessToken || j.access || j.token || null;
      } catch {
        return text && text.length > 20 ? text : null;
      }
    };

    const silentRefresh = async () => {
      try {
        // 보통 POST /api/auth/refresh (쿠키 포함)
        let res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json' }
        });

        // 서버가 GET만 열려있다면 폴백
        if (!res.ok && res.status !== 401) {
          res = await fetch(`${API_BASE}/api/auth/refresh`, {
            method: 'GET',
            credentials: 'include',
            headers: { Accept: 'application/json' }
          });
        }

        if (!res.ok) return; // 비로그인/만료

        const newAccess = await tryParseAccessFromResponse(res);
        if (!newAccess || aborted) return;

        localStorage.setItem('accessToken', newAccess);
        const payload = decodeJwt(newAccess) || {};
        dispatch(
          loginAction({
            email: payload.email || payload.memEmail || '',
            nickname: payload.name || '',
            pw: '',
            role: (payload.rolenames && payload.rolenames[0]) || payload.role || 'USER',
            memberId: payload.memId || payload.cargoId || payload.sub || null,
          })
        );
      } catch {
        // 무시
      }
    };

    silentRefresh();
    return () => { aborted = true; };
  }, [hasReduxLogin, accessToken, dispatch]);

  // ✅ 2) 새로고침 시 accessToken으로 Redux 하이드레이트
  React.useEffect(() => {
    if (!hasReduxLogin && accessToken) {
      const payload = decodeJwt(accessToken);
      if (payload) {
        dispatch(
          loginAction({
            email: payload.email || payload.memEmail || '',
            nickname: payload.name || '',
            pw: '',
            role: (payload.rolenames && payload.rolenames[0]) || payload.role || 'USER',
            memberId: payload.memId || payload.cargoId || payload.sub || null,
          })
        );
      }
    }
  }, [hasReduxLogin, accessToken, dispatch]);

  const [anchorElNav, setAnchorElNav]   = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu   = (e) => setAnchorElNav(e.currentTarget);
  const handleOpenUserMenu  = (e) => setAnchorElUser(e.currentTarget);
  const handleCloseNavMenu  = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  // ✅ 3) 로그아웃: 서버에도 알림 보내 쿠키 만료 권장
  const handleLogout = async () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch { /* ignore */ }

      dispatch(logoutAction());
    } finally {
      handleCloseUserMenu();
      navigate('/login', { replace: true });
    }
  };

  return (
    <AppBar position="static" sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: '#299AF0' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          {/* 데스크톱 로고 */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'bold',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            <img src="/image/logo/KakaoTalk_20250508_113520617.png" alt="Logo" style={{ height: 40 }} />
          </Typography>

          {/* 모바일 메뉴 버튼 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="open navigation"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page.label} to={page.path} component={Link} onClick={handleCloseNavMenu}>
                  <Typography sx={{ textAlign: 'center' }}>{page.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* 모바일 로고 */}
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            <img src="/image/logo/KakaoTalk_20250508_113520617.png" alt="Logo" style={{ height: 40 }} />
          </Typography>

          {/* 데스크톱 메뉴 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.label}
                to={page.path}
                component={Link}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block', fontSize: 20, pr: 3 }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          {/* 우측 사용자 영역 */}
          {isLogin ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="User" src="/image/icon/channels4_profile.jpg" sx={{ width: 48, height: 48 }} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((s) => {
                  if (s.label === '로그아웃') {
                    return (
                      <MenuItem key={s.label} onClick={handleLogout}>
                        <Typography sx={{ textAlign: 'center' }}>{s.label}</Typography>
                      </MenuItem>
                    );
                  }
                  return (
                    <MenuItem key={s.label} onClick={handleCloseUserMenu} component={Link} to={s.path}>
                      <Typography sx={{ textAlign: 'center' }}>{s.label}</Typography>
                    </MenuItem>
                  );
                })}
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button to="/login" component={Link} sx={{ fontSize: 18, color: 'inherit' }}>
                로그인
              </Button>
              <Button to="/signup" component={Link} sx={{ fontSize: 18, color: 'inherit' }}>
                회원가입
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
