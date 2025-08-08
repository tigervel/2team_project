import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Container, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Typography, TextField, FormHelperText, MenuItem, Box, Autocomplete, Button, Select } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';

import useIdForm from '../../../hooks/useIdForm';
import usePasswordForm from '../../../hooks/usePasswordForm';

const SignUpComponent = () => {

    // 기본 선택값 -> 화주
    const [alignment, setAlignment] = React.useState('user');
    const handleAlignment = (event, newAlignment) => {
        setAlignment(newAlignment);
    };

    // ID
    const { id, isDuplicate, handleChange, isIdValid } = useIdForm();
    const {
        password,
        isPwValid,
        showPassword1,
        showPassword2,
        handleChangePassword1,
        toggleShowPassword1,
        toggleShowPassword2,
    } = usePasswordForm();

    const [selected, setSelected] = React.useState(false);

    // password
    const [password2, setPassword2] = React.useState('');
    const [isPwMatch, setIsPwMatch] = React.useState(null);

    // 비밀번호 재입력 핸들러
    const handleChangePassword2 = (e) => {
        const value = e.target.value;
        setPassword2(value);
        setIsPwMatch(value === password);
    };

    // 이메일
    const domainOptions = [
        'gmail.com',
        'naver.com',
        'daum.net',
    ];

    // 휴대폰
    const [phone, setPhone] = React.useState('');
    const handlePhoneNumChange = (event) => {
        setPhone(event.target.value);
    };

    // 주소
    const [selectedAddress, setSelectedAddress] = React.useState('');

    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: (data) => {
                setSelectedAddress(data.address); // 선택된 주소를 상태에 저장
            },
        }).open();
    };

    return (
        <>
            <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
                <Paper elevation={3} sx={{ p: 4, maxWidth: '80%', minWidth:'50%'}}>
                    <Typography variant="h5" align="center" gutterBottom sx={{ mb: 2 }}>
                        회원가입
                    </Typography>

                    <ToggleButtonGroup
                        value={alignment}
                        exclusive
                        onChange={handleAlignment}
                        fullWidth
                        aria-label="user type"
                        sx={{ mb: 2 }}
                    >
                        <ToggleButton value="user" sx={{ width: '50%' }}>
                            화주
                        </ToggleButton>
                        <ToggleButton value="car" sx={{ width: '50%' }}>
                            차주
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Box display="flex" alignItems="felx-start" gap={1} sx={{ mb: 1.5 }}>

                            <TextField
                                id="outlined-id"
                                name="id"
                                label="ID"
                                value={id}
                                onChange={handleChange}
                                error={id !== '' && (!isIdValid || isDuplicate)}
                                helperText={
                                    id === ''
                                    ? ''
                                    : !isIdValid
                                        ? '8~15자, 영문 대소문자와 숫자만 허용됩니다.'
                                        : isDuplicate
                                        ? '이미 사용 중인 ID입니다.'
                                        : '사용 가능한 ID입니다.'
                                }
                                sx={{ width: '99% '}}
                            />
                            
                        <Box sx={{ width: '30%', display: 'flex', alignItems: 'flex-start' }}>
                            <Button variant="outlined" size="large" sx={{height: '55px', display: 'flex', alignSelf:'stretch' }}>
                                중복확인
                            </Button>
                        </Box>                        
                    </Box>

                    <FormControl sx={{ width: '100%', mb: 1.5 }} variant="outlined" error={isPwValid === false}>
                        <InputLabel htmlFor="password1">Password</InputLabel>
                        <OutlinedInput
                            id="password1"
                            type={showPassword1 ? 'text' : 'password'}
                            value={password}
                            onChange={handleChangePassword1}
                            label="Password"
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={toggleShowPassword1}
                                        onMouseDown={(e) => e.preventDefault()}
                                        edge="end"
                                    >
                                        {showPassword1 ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                        <FormHelperText>
                            {isPwValid === null ? '' : isPwValid
                                ? '사용 가능한 비밀번호입니다.' : '영문, 숫자, 특수문자 포함 8~20자여야 합니다.'}
                        </FormHelperText>
                    </FormControl>

                    <FormControl sx={{ width: '100%', mb: 1.5 }} variant="outlined">
                        <InputLabel htmlFor="password2">Password 재입력</InputLabel>
                        <OutlinedInput
                            id="password2"
                            type={showPassword2 ? 'text' : 'password'}
                            value={password2}
                            onChange={handleChangePassword2}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={toggleShowPassword2}
                                        onMouseDown={(e) => e.preventDefault()}
                                        edge="end"
                                    > {showPassword2 ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                        label="Password reinput"
                        />
                        {/* 불일치 메시지는 password2가 비어있지 않을 때만 표시 */}
                        {isPwMatch === false && password2 !== '' && (
                            <Typography color="error" variant="caption"> 비밀번호가 일치하지 않습니다.</Typography>
                        )}
                    </FormControl>

                    

                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                        <TextField id="outlined-basic" label="Email" variant="outlined" sx={{ width: '45%', mr: 1.3}} /> 
                        <Typography sx={{ width: '7%' }}> @</Typography>
                        <Autocomplete
                            freeSolo
                            options={domainOptions}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="선택"
                                    variant="outlined"
                                />
                            )}
                            sx={{ width: '45%'}}
                        />
                    </Box>
                    

                    <TextField id="outlined-basic" label="이름" variant="outlined" sx={{ width: '100%', mb: 1.5 }} />

                    <Box display="flex" alignItems="felx-start" gap={1} sx={{ mb: 1.5 }}>

                            <TextField id="outlined-basic" label="전화번호" variant="outlined" sx={{ width: '99%' }} />
                            
                        <Box sx={{ width: '30%', display: 'flex', alignItems: 'flex-start' }}>
                            <Button variant="outlined" size="large" sx={{height: '55px', display: 'flex', alignSelf:'stretch' }}>
                                인증하기
                            </Button>
                        </Box>                        
                    </Box>
                    

                    <TextField
                        disabled
                        label="주소"
                        value={selectedAddress}
                        fullWidth
                        InputProps={{
                            input:{readOnly: true},
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleAddressSearch}>
                                        <SearchIcon />
                                    </IconButton>
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
                            <Autocomplete
                                disablePortal
                                options={['1톤', '1.4톤', '2.5톤', '5톤', '8톤', '11톤', '25톤', '25톤 이상']}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="톤수 선택"
                                        variant="outlined"
                                    />
                                )}
                                sx={{ width: '80%' }}
                            />
                        </Box>
                    </Box>
                    )}

                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start' }}>
                        <Button variant="outlined" size="large" sx={{ width: '100%', height: '55px', display: 'flex', alignSelf:'stretch' }}>
                            회원가입
                        </Button>
                    </Box> 
                </Paper>
            </Container>

        </>
    );
};

export default SignUpComponent;