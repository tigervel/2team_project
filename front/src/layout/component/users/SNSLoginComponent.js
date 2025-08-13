import { Link } from "react-router-dom";
import { getKakaoLogin } from "../../../api/getKakaoLoginLink";
import { Button } from "@mui/material";
import { getNaverLogin } from "../../../api/getNaverLoginLink";
import { getGoogleLogin } from "../../../api/getGoogleLoginLink";

const naverLoginData = getNaverLogin(); // { url, state }

const kakaoLoginUrl = getKakaoLogin();  // 문자열 URL

const googleLoginData = getGoogleLogin(); // { url, state }

const socialSignIn = (providerId) => {
    let url = "";
    switch (providerId) {
        case "google":
            url = googleLoginData.url;
            break;
        case "kakao":
            url = kakaoLoginUrl;
            break;
        case "naver":
            url = naverLoginData.url;
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

const SNSLoginComponent = () => {
    const kakaolink = getKakaoLogin();
    const naverlink = getNaverLogin();
    const googlelink = getGoogleLogin();

    return(
        <>
            <Button
                fullWidth
                variant="outlined"
                sx={ButtonStyle}
                onClick={() => socialSignIn('naver')}
            >
                <Link to={naverlink} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
                    <img src="/assets/naver-icon.png" alt="Naver" style={{ width: 20, height: 20 }} />
                        <span>Sign in with Naver</span>
                </Link>
            </Button>

            <Button
                fullWidth
                variant="outlined"
                sx={ButtonStyle}
                onClick={() => socialSignIn('kakao')}
            >
                <Link to={kakaolink} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
                    <img src="/assets/kakao-icon.png" alt="Kakao" style={{ width: 20, height: 20 }} />
                    <span>Sign in with Kakao</span>
                </Link>
            </Button>

            <Button
                fullWidth
                variant="outlined"
                sx={ButtonStyle}
                onClick={() => socialSignIn('google')}
            >
                <Link to={googlelink} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
                    <img src="/assets/google-icon.png" alt="Google" style={{ width: 20, height: 20 }} />
                    <span>Sign in with Google</span>
                </Link>
            </Button>            
        </>
    
    )
}
export default SNSLoginComponent;