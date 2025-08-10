import { Link } from "react-router-dom";
import { getKakaoLogin } from "../../../api/getKakaoLoginLink";
import { Button } from "@mui/material";

const socialSignIn = (providerId) => {
    let url = '';
    switch (providerId) {
        case 'google':
            url = 'http://localhost:3000/oauth2/authorization/google';
            break;
        case 'kakao':
            url = 'http://localhost:8080n/oauth2/authorization/kakao';
            break;
        case 'naver':
            url = 'http://localhost:3000/oauth2/authorization/naver';
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

const KakaoLoginComponent = () => {
    const link = getKakaoLogin();

    return(
        <Button
            fullWidth
            variant="outlined"
            sx={ButtonStyle}
            onClick={() => socialSignIn('kakao')}
        >
            <img src="/assets/kakao-icon.png" alt="Kakao" style={{ width: 20, height: 20 }} />
            <span>Sign in with Kakao</span>
        </Button>
    
    )
}
export default KakaoLoginComponent;