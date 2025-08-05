import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Container, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Typography, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, FormHelperText } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';

import useIdForm from '../../../hooks/useIdForm';
import usePasswordForm from '../../../hooks/usePasswordForm';
import useAddressSearch from '../../../hooks/useAddressSearch';

const REST_API_KEY = "d381d00137ba5677a3ee0355c4c95abf";

const SignUpComponent = () => {


    const { id, isDuplicate, handleChange, isIdValid } = useIdForm();
    const {
        password,
        isPwValid,
        showPassword1,
        showPassword2,
        handleChangePassword,
        toggleShowPassword1,
        toggleShowPassword2,
    } = usePasswordForm();
    const {
        openDialog,
        searchQuery,
        setSearchQuery,
        searchResults,
        selectedAddress,
        handleOpenDialog,
        handleCloseDialog,
        handleSearch,
        handleSelectAddress,
    } = useAddressSearch(REST_API_KEY);

    const [password2, setPassword2] = React.useState('');
    const [isPwMatch, setIsPwMatch] = React.useState(null);

    // 비밀번호 재입력 핸들러
    const handleChangePassword2 = (e) => {
        const value = e.target.value;
        setPassword2(value);
        setIsPwMatch(value === password);
    };

    const [alignment, setAlignment] = React.useState('user');
    const handleAlignment = (event, newAlignment) => {
        setAlignment(newAlignment);
    };

    return (
        <>
            <Container maxWidth="sm" sx={{ mt: 8,  }}>
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
                        sx={{ mb: 1, width: '75%' }}
                    />


                    <FormControl sx={{ width: '100%', mb: 1 }} variant="outlined" error={isPwValid === false}>
                        <InputLabel htmlFor="password1">Password</InputLabel>
                        <OutlinedInput
                            id="password1"
                            type={showPassword1 ? 'text' : 'password'}
                            value={password}
                            onChange={handleChangePassword}
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

                    <FormControl sx={{ width: '100%', mb: 1 }} variant="outlined">
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
                    </FormControl>

                    {/* 불일치 메시지는 password2가 비어있지 않을 때만 표시 */}
                    {isPwMatch === false && password2 !== '' && (
                        <Typography color="error" variant="caption"> 비밀번호가 일치하지 않습니다.</Typography>
                    )}

                    <TextField id="outlined-basic" label="이름" variant="outlined" sx={{ width: '100%', mb: 1 }} />

                    <TextField
                        label="주소 선택"
                        value={selectedAddress}
                        fullWidth
                        InputProps={{
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position="end">
                            <IconButton onClick={handleOpenDialog}>
                                <SearchIcon />
                            </IconButton>
                            </InputAdornment>
                        ),
                        }}
                        sx={{ mb: 0 }}
                    />
                </Paper>
            </Container>

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>주소 검색</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="주소 입력"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        fullWidth
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />{searchResults.map((item, index) => (
                        <Button
                            key={index}
                            fullWidth
                            onClick={() => handleSelectAddress(item)}
                            sx={{ justifyContent: 'flex-start', mb: 1 }}
                        > {item.address_name} </Button>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>닫기</Button>
                    <Button onClick={handleSearch}>검색</Button>
                </DialogActions>
            </Dialog>

        </>
    );
};

export default SignUpComponent;