// src/pages/OAuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OAuthSuccess() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get("token");

    useEffect(() => {
        if (!token) {
            navigate("/login?error=missing_token", { replace: true });
            return;
        }
        // 토큰 저장 (원하는 저장소 사용)
        localStorage.setItem("access_token", token);

        // 주소 깔끔하게 정리
        navigate("/", { replace: true });
    }, [token, navigate]);

    return null; // 잠깐 빈 화면
}
