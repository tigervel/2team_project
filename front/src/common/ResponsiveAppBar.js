import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { Link, useNavigate } from 'react-router-dom';

const pages = [
  { label: '견적서 작성', path: '/estimatepage' },
  { label: '운송 접수 사항', path: '/estimatepage/list' },
  { label: '고객지원', path: '/qaboard' },
  { label: '문의사항', path: '/qaboard' }
];

function ResponsiveAppBar() {
  const navigate = useNavigate();

  // 모바일 네비게이션 메뉴 상태
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  // 로그인 여부 (스토리지 토큰 존재 여부로 판단)
  const isAuthenticated = Boolean(
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken')
  );

  // 토큰 변경(다른 탭 등) 반영
  const [, forceRender] = React.useState(0);
  React.useEffect(() => {
    const onStorage = () => forceRender((x) => x + 1);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const API_BASE =
    import.meta?.env?.VITE_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    'http://localhost:8080';

  // 로그아웃: 토큰 삭제 → 서버 로그아웃 시도(있으면) → 이동
  const handleLogout = async () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');

      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'user_logout' })
        });
      } catch {
        /* 서버에 엔드포인트가 없어도 무시 */
      }
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#299AF0' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          {/* 좌측 로고 (데스크탑) */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'bold',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <img
              src="../../image/logo/KakaoTalk_20250508_113520617.png"
              alt="Logo"
              style={{ height: '40px' }}
            />
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

            {/* 모바일 드롭다운 메뉴 */}
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
                <MenuItem
                  key={page.label}
                  to={page.path}
                  component={Link}
                  onClick={handleCloseNavMenu}
                >
                  <Typography sx={{ textAlign: 'center' }}>{page.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* 모바일 로고 */}
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <img
              src="../../image/logo/KakaoTalk_20250508_113520617.png"
              alt="Logo"
              style={{ height: '40px' }}
            />
          </Typography>

          {/* 상단 메뉴 (데스크탑) */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.label}
                to={page.path}
                component={Link}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block', fontSize: '20px', paddingRight: '25px' }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          {/* 우측 액션: 로그인 상태에 따라 분기 */}
          <Box sx={{ flexGrow: 0, display: 'flex', gap: 1 }}>
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                sx={{ fontSize: '18px', color: 'inherit' }}
                variant="text"
              >
                로그아웃
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/signup"
                  sx={{ fontSize: '18px', color: 'inherit' }}
                  variant="text"
                >
                  회원가입
                </Button>
                <Button
                  component={Link}
                  to="/login"
                  sx={{ fontSize: '18px', color: 'inherit' }}
                  variant="text"
                >
                  로그인
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
