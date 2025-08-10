import { useState } from "react";
import useCustomLogin from "../../../hooks/useCustomLogin";
import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const initState = { id: '', pw: '' };

const LoginComponent = () => {
  const [loginParam, setLoginParam] = useState({ ...initState });
  const { doLogin, moveToPath } = useCustomLogin();
  const theme = useTheme();

  const handleChange = (e) => {
    loginParam[e.target.name] = e.target.value;
    setLoginParam({ ...loginParam });
  };

  const handleClickLogin = () => {
    doLogin(loginParam).then((data) => {
      if (data.error) {
        alert('계정 확인바람');
      } else {
        alert('로그인 성공');
        moveToPath('/');
      }
    });
  };

  const socialSignIn = (providerId) => {
    let url = '';
    switch (providerId) {
      case 'google':
        url = 'http://localhost:8080/oauth2/authorization/google';
        break;
      case 'kakao':
        url = 'http://localhost:8080/oauth2/authorization/kakao';
        break;
      case 'naver':
        url = 'http://localhost:8080/oauth2/authorization/naver';
        break;
      default:
        break;
    }
    window.location.href = url;
  };

  const ButtonStyle = {
    mb: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    fontFamily: 'SUIT, sans-serif',
    fontSize: '13px',
    textTransform: 'none',
  };

  return (
    <AppProvider theme={theme}>
      {/* 화면 중앙 정렬 컨테이너 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '90vh',
          backgroundColor: '#f5f5f5',
          px: 2,
        }}
      >
        {/* 로그인 박스 */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            p: 4,
            border: '1px solid #ddd',
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: 'white',
            fontFamily: 'SUIT, sans-serif',
          }}
        >
          <Typography variant="h5" align="center" gutterBottom>
            Sign in
          </Typography>

          {/* ID/PW 입력 */}
          <TextField
            label="id"
            name="id"
            value={loginParam.id}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 1 }} // margin-bottom 1단위 (8px)
          />
          <TextField
            label="Password"
            name="pw"
            type="password"
            value={loginParam.pw}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 1 }}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={ButtonStyle}
            onClick={handleClickLogin}
          >
            로그인
          </Button>

          <Box sx={{display: 'flex', justifyContent: 'center', fontFamily: 'SUIT, sans-serif', fontSize: '13px', textTransform: 'none'}}>
            <Button>아이디 찾기</Button> <Button>비밀번호 찾기</Button>
          </Box>

          <Divider sx={{ my: 3 }}>OR</Divider>

          {/* 소셜 로그인 버튼들 */}
          <Button
            fullWidth
            variant="outlined"
            sx={ButtonStyle}
            onClick={() => socialSignIn('naver')}
          >
            <img src="/assets/naver-icon.png" alt="Naver" style={{ width: 20, height: 20 }} />
            <span>Sign in with Naver</span>
          </Button>

          <Button
            fullWidth
            variant="outlined"
            sx={ButtonStyle}
            onClick={() => socialSignIn('google')}
          >
            <img src="/assets/google-icon.png" alt="Google" style={{ width: 20, height: 20 }} />
            <span>Sign in with Google</span>
          </Button>

          <Button
            fullWidth
            variant="outlined"
            sx={ButtonStyle}
            onClick={() => socialSignIn('kakao')}
          >
            <img src="/assets/kakao-icon.png" alt="Kakao" style={{ width: 20, height: 20 }} />
            <span>Sign in with Kakao</span>
          </Button>
        </Box>
      </Box>
    </AppProvider>
  );
};

export default LoginComponent;
