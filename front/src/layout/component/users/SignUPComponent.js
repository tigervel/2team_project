import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Container, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Typography, TextField, FormHelperText, Box, Autocomplete, Button } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import useIdForm from '../../../hooks/useIdForm';
import usePasswordForm from '../../../hooks/usePasswordForm';
import EmailVerifyDialog from "../auth/EmailVerifyDialog"

const SignUpComponent = () => {
    // 사용자 유형 (화주/차주)
    const [alignment, setAlignment] = React.useState('user');
    const handleAlignment = (event, newAlignment) => setAlignment(newAlignment);

    // ID 폼 상태
    const { id, isDuplicate, handleChange, isIdValid } = useIdForm();

    // 버튼으로 검증했는지 여부 + 사용 가능 여부 + 상태
    const [idChecked, setIdChecked] = React.useState(false);
    const [idAvailable, setIdAvailable] = React.useState(null); // true | false | null(모름)
    const [idStatus, setIdStatus] = React.useState('idle');     // 'idle' | 'checking' | 'available' | 'taken' | 'error'

    // 비밀번호 폼 상태
    const {
        password,
        isPwValid,
        showPassword1,
        showPassword2,
        handleChangePassword1,
        toggleShowPassword1,
        toggleShowPassword2
    } = usePasswordForm();

    // 비밀번호 재입력 및 일치 여부
    const [password2, setPassword2] = React.useState('');
    const [isPwMatch, setIsPwMatch] = React.useState(null);
    React.useEffect(() => {
        if (password2 === '') setIsPwMatch(null);
        else setIsPwMatch(password2 === password);
    }, [password, password2]);

    // 이메일 도메인 옵션
    const domainOptions = ['gmail.com', 'naver.com', 'daum.net'];

    // 컴포넌트 내부 추가 상태
    const [emailLocal, setEmailLocal] = React.useState('');
    const [emailDomain, setEmailDomain] = React.useState('');
    const [emailVerified, setEmailVerified] = React.useState(false);
    const [openEmailModal, setOpenEmailModal] = React.useState(false);

    const fullEmail = React.useMemo(() => {
        const l = emailLocal.trim();
        const d = emailDomain.trim();
        return l && d ? `${l}@${d}` : '';
    }, [emailLocal, emailDomain]);

    const canOpenVerify = !!fullEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fullEmail);

    // “인증하기” 버튼 클릭
    const onClickVerifyEmail = () => {
        if (!canOpenVerify) return;
        setOpenEmailModal(true);
    };

    const handleEmailVerified = (ok) => {
        setEmailVerified(!!ok);
        if (ok) setOpenEmailModal(false);
    };

    const API_BASE =
        import.meta?.env?.VITE_API_BASE        // Vite
        || process.env.REACT_APP_API_BASE      // CRA
        || 'http://localhost:8080';            // 기본값(백엔드 포트)

    const handleCheckId = async () => {
        if (!id || !isIdValid) return;
        setIdStatus('checking');
        const url = `${API_BASE}/api/signup/check-id?memId=${encodeURIComponent(id)}`;
        try {
            const r = await fetch(url, { headers: { Accept: 'application/json' }, credentials: 'include' });
            console.log('Request URL =', r.url, 'status =', r.status); // 어디로 갔는지 확인
            const ct = r.headers.get('content-type') || '';
            const txt = await r.text();
            if (!ct.includes('application/json')) throw new Error(`status=${r.status} ct=${ct} body=${txt.slice(0, 120)}`);
            const data = JSON.parse(txt);

            // ✅ 렌더링에 쓰는 상태 갱신
            setIdAvailable(Boolean(data.available));
            setIdChecked(true);
            setIdStatus(data.available ? 'available' : 'taken');
        } catch (e) {
            console.error(e);
            // ✅ 에러도 확인됨으로 처리해 메시지 노출
            setIdChecked(true);
            setIdAvailable(null);
            setIdStatus('error');
        }
    };

    // 주소 검색
    const [selectedAddress, setSelectedAddress] = React.useState('');
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: (data) => setSelectedAddress(data.address)
        }).open();
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
            <Paper elevation={3} sx={{ p: 4, maxWidth: '80%', minWidth: '50%' }}>
                <Typography variant="h5" align="center" gutterBottom sx={{ mb: 2 }}>회원가입</Typography>

                <ToggleButtonGroup value={alignment} exclusive onChange={handleAlignment} fullWidth sx={{ mb: 2 }}>
                    <ToggleButton value="user" sx={{ width: '50%' }}>화주</ToggleButton>
                    <ToggleButton value="car" sx={{ width: '50%' }}>차주</ToggleButton>
                </ToggleButtonGroup>

                <Box display="flex" alignItems="flex-start" gap={1} sx={{ mb: 1.5 }}>
                    <TextField
                        id="outlined-id"
                        name="id"
                        label="ID"
                        value={id}
                        onChange={(e) => {
                            handleChange(e);
                            // ✅ 입력 바뀌면 상태 초기화
                            setIdChecked(false);
                            setIdAvailable(null);
                            setIdStatus('idle');
                        }}
                        error={
                            id !== '' && idChecked && (
                                idStatus === 'error' || !isIdValid || idAvailable === false
                            )
                        }
                        helperText={
                            id === ''
                                ? ''
                                : !idChecked
                                    ? '8~15자, 영문 대소문자와 숫자만 허용됩니다.'
                                    : idStatus === 'error'
                                        ? '확인 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.'
                                        : !isIdValid
                                            ? ''
                                            : idAvailable === false
                                                ? '이미 사용 중인 ID입니다.'
                                                : '사용 가능한 ID입니다.'
                        }
                        sx={{ width: '99%' }}
                    />
                    <Box sx={{ width: '30%', display: 'flex' }}>
                        <Button
                            variant="outlined"
                            size="large"
                            sx={{ height: '55px', flex: 1 }}
                            onClick={handleCheckId}
                            disabled={!id || !isIdValid || idStatus === 'checking'} // ✅ 확인 중 비활성화
                        >
                            {idStatus === 'checking' ? '확인 중...' : '중복확인'}
                        </Button>
                    </Box>
                </Box>

                <FormControl sx={{ width: '100%', mb: 1.5 }} variant="outlined" error={isPwValid === false}>
                    <InputLabel htmlFor="password1">Password</InputLabel>
                    <OutlinedInput id="password1" autoComplete="new-password"
                        type={showPassword1 ? 'text' : 'password'}
                        value={password}
                        onChange={handleChangePassword1}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={toggleShowPassword1} onMouseDown={(e) => e.preventDefault()} edge="end">
                                    {showPassword1 ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Password"
                    />
                    <FormHelperText>{isPwValid === null ? '' : isPwValid ? '사용 가능한 비밀번호입니다.' : '영문, 숫자, 특수문자 포함 8~20자여야 합니다.'}</FormHelperText>
                </FormControl>

                <FormControl sx={{ width: '100%', mb: 1.5 }} variant="outlined">
                    <InputLabel htmlFor="password2">Password 재입력</InputLabel>
                    <OutlinedInput id="password2" autoComplete="new-password"
                        type={showPassword2 ? 'text' : 'password'}
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={toggleShowPassword2} onMouseDown={(e) => e.preventDefault()} edge="end">
                                    {showPassword2 ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Password reinput"
                    />
                    {isPwMatch === false && password2 !== '' && (
                        <Typography color="error" variant="caption">비밀번호가 일치하지 않습니다.</Typography>
                    )}
                </FormControl>

                <Box display="flex" gap={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <TextField
                        label="Email"
                        value={emailLocal}
                        onChange={(e) => { setEmailLocal(e.target.value); setEmailVerified(false); }}
                        sx={{ flex: '1 1 0', mr: 1.3 }}
                    />
                    <Typography
                        sx={{ width: 32, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        @
                    </Typography>
                    <Autocomplete
                        freeSolo
                        options={domainOptions}
                        value={emailDomain}
                        onInputChange={(_, v) => { setEmailDomain(v); setEmailVerified(false); }}
                        renderInput={(params) => <TextField {...params} label="선택" />}
                        sx={{ flex: '1 1 0' }}
                    />
                    <Button
                        variant={emailVerified ? "contained" : "outlined"}
                        color={emailVerified ? "success" : "primary"}
                        size="large"
                        sx={{ height: 56, whiteSpace: 'nowrap' }}
                        onClick={onClickVerifyEmail}
                        disabled={!canOpenVerify}
                    >
                        {emailVerified ? "인증완료" : "인증하기"}
                    </Button>
                </Box>

                {/* 모달 */}
                <EmailVerifyDialog
                    open={openEmailModal}
                    email={fullEmail}
                    onClose={() => setOpenEmailModal(false)}
                    onVerified={handleEmailVerified}
                />

                <TextField id="outlined-basic" label="이름" variant="outlined" sx={{ width: '100%', mb: 1.5 }} />
                <TextField id="outlined-basic" label="전화번호" variant="outlined" sx={{ width: '100%', mb: 1.5 }} />

                <TextField
                    disabled
                    label="주소"
                    value={selectedAddress}
                    fullWidth
                    InputProps={{
                        input: { readOnly: true },
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleAddressSearch}><SearchIcon /></IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: '100%', mb: 1.5 }}
                />

                <TextField id="outlined-basic" label="상세 주소" variant="outlined" sx={{ width: '100%', mb: 1.5 }} />

                {alignment === 'car' && (
                    <Box>
                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                            <Typography sx={{ width: '20%', ml: 1 }}>화물차 무게</Typography>
                            <Autocomplete disablePortal options={['1톤', '1.4톤', '2.5톤', '5톤', '8톤', '11톤', '25톤', '25톤 이상']} renderInput={(params) => <TextField {...params} label="톤수 선택" variant="outlined" />} sx={{ width: '80%' }} />
                        </Box>
                    </Box>
                )}

                <Box sx={{ width: '100%', display: 'flex' }}>
                    <Button variant="outlined" size="large" sx={{ width: '100%', height: '55px' }}>회원가입</Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default SignUpComponent;
