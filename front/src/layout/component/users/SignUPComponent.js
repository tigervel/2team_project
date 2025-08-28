import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {
    Container, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput,
    Paper, Typography, TextField, FormHelperText, Box, Autocomplete, Button
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import useIdForm from '../../../hooks/useIdForm';
import usePasswordForm from '../../../hooks/usePasswordForm';
import EmailVerifyDialog from "../auth/EmailVerifyDialog";

const SignUpComponent = () => {
    const navigate = useNavigate();

    // 사용자 유형 (화주/차주)
    const [alignment, setAlignment] = React.useState('user'); // user=화주, car=차주
    const handleAlignment = (_, v) => { if (v) setAlignment(v); };
    const roles = alignment === 'car' ? 'DRIVER' : 'SHIPPER';

    // ID 폼 상태
    const { id, handleChange, isIdValid } = useIdForm();
    const [idChecked, setIdChecked] = React.useState(false);
    const [idAvailable, setIdAvailable] = React.useState(null);
    const [idStatus, setIdStatus] = React.useState('idle'); // idle | checking | available | taken | error
    const [idTouched, setIdTouched] = React.useState(false);

    // 비밀번호 폼 상태
    const {
        password1, password2, isPwValid, isPwMatch,
        showPassword1, showPassword2,
        handleChangePassword1, handleChangePassword2,
        toggleShowPassword1, toggleShowPassword2
    } = usePasswordForm();
    const [pw1Touched, setPw1Touched] = React.useState(false);
    const [pw2Touched, setPw2Touched] = React.useState(false);

    // 기타 폼
    const domainOptions = ['gmail.com', 'naver.com', 'daum.net'];
    const [emailLocal, setEmailLocal] = React.useState('');
    const [emailDomain, setEmailDomain] = React.useState('');
    const [emailVerified, setEmailVerified] = React.useState(false);
    const [openEmailModal, setOpenEmailModal] = React.useState(false);

    const [name, setName] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [selectedAddress, setSelectedAddress] = React.useState('');
    const [detailAddress, setDetailAddress] = React.useState('');

    const [submitting, setSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState('');

    const fullEmail = React.useMemo(() => {
        const l = emailLocal.trim(); const d = emailDomain.trim();
        return l && d ? `${l}@${d}` : '';
    }, [emailLocal, emailDomain]);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const canOpenVerify = !!fullEmail && emailRegex.test(fullEmail);

    const onClickVerifyEmail = () => {
        if (!canOpenVerify) return;
        setOpenEmailModal(true);
    };
    const handleEmailVerified = (ok) => {
        setEmailVerified(!!ok);
        if (ok) setOpenEmailModal(false);
    };

    const API_BASE =
        import.meta?.env?.VITE_API_BASE
        || process.env.REACT_APP_API_BASE
        || 'http://localhost:8080';

    // ID 중복 확인
    const handleCheckId = async () => {
        if (!id || !isIdValid) return;
        setIdStatus('checking');
        setIdChecked(false);
        setIdAvailable(null);

        const tryCheck = async (paramName) => {
            const url = `${API_BASE}/api/signup/check-id?${paramName}=${encodeURIComponent(id)}`;
            const r = await fetch(url, { headers: { Accept: 'application/json' } });
            const txt = await r.text();
            try { return JSON.parse(txt); } catch { return { available: false }; }
        };

        try {
            let data = await tryCheck('loginId'); // 서버 구현에 맞게 조정
            if (typeof data.available === 'undefined') data = await tryCheck('memId');
            const available = Boolean(data.available);
            setIdAvailable(available);
            setIdChecked(true);
            setIdStatus(available ? 'available' : 'taken');
        } catch (e) {
            console.error(e);
            setIdChecked(true);
            setIdAvailable(null);
            setIdStatus('error');
        }
    };

    // 주소 검색
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: (data) => setSelectedAddress(data.address)
        }).open();
    };

    // 제출 가능 여부
    const canSubmit =
        isIdValid &&
        idChecked && idAvailable === true &&
        isPwValid && isPwMatch &&
        !!fullEmail && emailVerified &&
        name.trim().length > 0 &&
        password1.length >= 8;

    // 가입 요청
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitError('');
        setSubmitting(true);
        try {
            const payload = {
                roles,                               // "SHIPPER" or "DRIVER"
                loginId: id,                        // DTO 키와 동일
                password: password1,
                name,
                email: fullEmail,
                phone,
                address: `${selectedAddress} ${detailAddress}`.trim()
            };

            const res = await fetch(`${API_BASE}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch { data = text; }

            if (!res.ok) {
                const msg = Array.isArray(data) ? data.join('\n') : (data || '가입 실패');
                setSubmitError(msg);
                return;
            }

            // 성공: 메인으로 이동
            navigate('/', { replace: true });
        } catch (err) {
            console.error(err);
            setSubmitError('네트워크 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
            <Paper elevation={3} sx={{ p: 4, maxWidth: '80%', minWidth: '50%' }} component="form" onSubmit={onSubmit}>
                <Typography variant="h5" align="center" gutterBottom sx={{ mb: 2 }}>회원가입</Typography>

                <ToggleButtonGroup value={alignment} exclusive onChange={handleAlignment} fullWidth sx={{ mb: 2 }}>
                    <ToggleButton value="user" sx={{ width: '50%' }}>화주</ToggleButton>
                    <ToggleButton value="car" sx={{ width: '50%' }}>차주</ToggleButton>
                </ToggleButtonGroup>

                {/* ID */}
                <Box display="flex" alignItems="flex-start" gap={1} sx={{ mb: 1.5 }}>
                    <TextField
                        id="outlined-id"
                        label="ID"
                        value={id}
                        onChange={(e) => {
                            handleChange(e);
                            setIdChecked(false);
                            setIdAvailable(null);
                            setIdStatus('idle');
                        }}
                        onFocus={() => setIdTouched(true)}
                        onBlur={() => setIdTouched(false)}
                        error={(idTouched || idChecked) && id !== '' && (idStatus === 'error' || !isIdValid || idAvailable === false)}
                        helperText={
                            (idTouched || idChecked) && id !== ''
                                ? (!idChecked
                                    ? '8~15자, 영문 대소문자와 숫자만 허용됩니다.'
                                    : idStatus === 'error'
                                        ? '확인 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.'
                                        : !isIdValid
                                            ? ''
                                            : idAvailable === false
                                                ? '이미 사용 중인 ID입니다.'
                                                : '사용 가능한 ID입니다.')
                                : ''
                        }
                        sx={{ width: '99%' }}
                    />
                    <Box sx={{ width: '30%', display: 'flex' }}>
                        <Button
                            variant="outlined"
                            size="large"
                            sx={{ height: '55px', flex: 1 }}
                            onClick={handleCheckId}
                            disabled={!id || !isIdValid || idStatus === 'checking'}
                        >
                            {idStatus === 'checking' ? '확인 중...' : '중복확인'}
                        </Button>
                    </Box>
                </Box>

                {/* 비밀번호 */}
                <FormControl sx={{ width: '100%', mb: 1.5 }} variant="outlined" error={pw1Touched && isPwValid === false}>
                    <InputLabel htmlFor="password1">Password</InputLabel>
                    <OutlinedInput
                        id="password1"
                        autoComplete="new-password"
                        type={showPassword1 ? 'text' : 'password'}
                        value={password1}
                        onChange={handleChangePassword1}
                        onFocus={() => setPw1Touched(true)}
                        onBlur={() => setPw1Touched(false)}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={toggleShowPassword1} onMouseDown={(e) => e.preventDefault()} edge="end">
                                    {showPassword1 ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Password"
                    />
                    {pw1Touched && (
                        <FormHelperText>
                            {isPwValid === null ? '' : isPwValid ? '사용 가능한 비밀번호입니다.' : '영문, 숫자, 특수문자 포함 8~20자여야 합니다.'}
                        </FormHelperText>
                    )}
                </FormControl>

                {/* 비밀번호 재입력 */}
                <FormControl sx={{ width: '100%', mb: 1.5 }} variant="outlined" error={pw2Touched && isPwMatch === false}>
                    <InputLabel htmlFor="password2">Password 재입력</InputLabel>
                    <OutlinedInput
                        id="password2"
                        autoComplete="new-password"
                        type={showPassword2 ? 'text' : 'password'}
                        value={password2}
                        onChange={handleChangePassword2}
                        onFocus={() => setPw2Touched(true)}
                        onBlur={() => setPw2Touched(false)}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={toggleShowPassword2} onMouseDown={(e) => e.preventDefault()} edge="end">
                                    {showPassword2 ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Password 재입력"
                    />
                    {pw2Touched && password2 !== '' && (
                        <Typography color={isPwMatch ? "success.main" : "error"} variant="caption">
                            {isPwMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
                        </Typography>
                    )}
                </FormControl>

                {/* 이메일 */}
                <Box display="flex" gap={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <TextField
                        label="Email"
                        value={emailLocal}
                        onChange={(e) => { setEmailLocal(e.target.value); setEmailVerified(false); }}
                        sx={{ flex: '1 1 0', mr: 1.3 }}
                    />
                    <Typography sx={{ width: 32, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>@</Typography>
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

                <EmailVerifyDialog
                    open={openEmailModal}
                    email={fullEmail}
                    onClose={() => setOpenEmailModal(false)}
                    onVerified={handleEmailVerified}
                />

                {/* 이름, 전화번호, 주소 */}
                <TextField
                    label="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                    sx={{ width: '100%', mb: 1.5 }}
                />
                <TextField
                    label="전화번호"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    variant="outlined"
                    sx={{ width: '100%', mb: 1.5 }}
                />
                <TextField
                    disabled
                    label="주소"
                    value={selectedAddress}
                    fullWidth
                    InputProps={{
                        inputProps: { readOnly: true },
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleAddressSearch}><SearchIcon /></IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: '100%', mb: 1.5 }}
                />
                <TextField
                    label="상세 주소"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    variant="outlined"
                    sx={{ width: '100%', mb: 1.5 }}
                />

                {/* 차주 전용 추가 정보 (선택) */}
                {alignment === 'car' && (
                    <Box>
                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                            <Typography sx={{ width: '20%', ml: 1 }}>화물차 무게</Typography>
                            <Autocomplete
                                disablePortal
                                options={['1톤', '1.4톤', '2.5톤', '5톤', '8톤', '11톤', '25톤', '25톤 이상']}
                                renderInput={(params) => <TextField {...params} label="톤수 선택" variant="outlined" />}
                                sx={{ width: '80%' }}
                            />
                        </Box>
                    </Box>
                )}

                {/* 서버 에러 */}
                {submitError && (
                    <Typography color="error" sx={{ mb: 1, whiteSpace: 'pre-line' }}>{submitError}</Typography>
                )}

                <Box sx={{ width: '100%', display: 'flex' }}>
                    <Button variant="outlined" size="large" sx={{ width: '100%', height: '55px' }}
                        type="submit" disabled={!canSubmit || submitting}>
                        {submitting ? '가입 중...' : '회원가입'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default SignUpComponent;
