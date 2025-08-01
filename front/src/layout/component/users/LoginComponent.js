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

  // 공통 버튼 스타일 정의
  const ButtonStyle = {
    mb: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    fontFamily: 'SUIT, sans-serif',
    fontSize: '13px',
    textTransform: 'none', // 대문자 방지
  };

  return (
    <AppProvider theme={theme}>
      <Box
        sx={{
          maxWidth: 400,
          margin: 'auto',
          marginTop: 10,
          padding: 4,
          border: '1px solid #ddd',
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: 'white',
          fontFamily: 'SUIT, sans-serif', // 폰트 전체 적용
          marginBottom: 10,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Sign in
        </Typography>

        {/* 이메일/비밀번호 입력 */}
        <TextField
          label="id"
          name="id"
          value={loginParam.id}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          name="pw"
          type="password"
          value={loginParam.pw}
          onChange={handleChange}
          fullWidth
          margin="normal"
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
    </AppProvider>
  );
};

export default LoginComponent;
