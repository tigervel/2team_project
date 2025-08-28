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

import { login as loginAction, logout as logoutAction } from '../slice/loginSlice'; // ✅ 경로 확인
import useCustomLogin from '../hooks/useCustomLogin'; // ✅ useCustomLogin 훅 임포트

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

const settingsAdmin = [
  { label: '관리자페이지', path: '/admin' },
  { label: '회원조회', path: '/admin/memberAll' },
  { label: '배송상태', path: '/admin/deliveryPage' },
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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLogin, isAdmin } = useCustomLogin(); // ✅ useCustomLogin 사용

  // 새로고침 시 토큰으로 하이드레이트
  React.useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (isLogin && accessToken) {
      const payload = decodeJwt(accessToken);
      if (payload) {
        dispatch(
          loginAction({
            email: payload.email || '',
            nickname: payload.name || '',
            pw: '',
            roles: payload.roles || ['USER'], // ✅ roles 배열 사용
            memberId: payload.memId || payload.cargoId || payload.sub || null,
          })
        );
      }
    }
  }, [isLogin, dispatch]);

  const [anchorElNav, setAnchorElNav]   = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu  = (e) => setAnchorElNav(e.currentTarget);
  const handleOpenUserMenu = (e) => setAnchorElUser(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  // ✅ 즉시 로그아웃 처리: 토큰/Redux 상태 삭제 → 메뉴 닫기 → 이동
  const handleLogout = async () => {
    try {
      // 클라이언트 토큰 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Redux 상태 초기화
      dispatch(logoutAction());
    } finally {
      handleCloseUserMenu();
      navigate('/login', { replace: true });
    }
  };

  const currentSettings = isAdmin ? settingsAdmin : settings; // ✅ 조건부 메뉴 선택

  return (
    <AppBar position="static" sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: '#299AF0' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          {/* 데스크톱 로고 (public/image 사용 권장) */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' }, fontFamily: 'bold', fontWeight: 700, letterSpacing: '.3rem', color: 'inherit', textDecoration: 'none' }}
          >
            <img src="/image/logo/KakaoTalk_20250508_113520617.png" alt="Logo" style={{ height: 40 }} />
          </Typography>

          {/* 모바일 메뉴 버튼 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" aria-label="open navigation" aria-controls="menu-appbar" aria-haspopup="true" onClick={handleOpenNavMenu} color="inherit">
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
            sx={{ mr: 2, display: { xs: 'flex', md: 'none' }, flexGrow: 1, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.3rem', color: 'inherit', textDecoration: 'none' }}
          >
            <img src="/image/logo/KakaoTalk_20250508_113520617.png" alt="Logo" style={{ height: 40 }} />
          </Typography>

          {/* 데스크톱 메뉴 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button key={page.label} to={page.path} component={Link} onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block', fontSize: 20, pr: 3 }}>
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
                {currentSettings.map((s) => { // ✅ 조건부 렌더링
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
