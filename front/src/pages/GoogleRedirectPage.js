import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../slice/loginSlice"; // Redux slice 경로 확인
import useCustomLogin from "../hooks/useCustomLogin"; // 커스텀 훅 경로 확인
import { getGoogleAccessToken, getMemberWithGoogleAccessToken } from "../api/getGoogleLoginLink"; // API 함수 경로 확인

const GoogleRedirectPage = () => {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { moveToPath } = useCustomLogin();

    useEffect(() => {
        const handleGoogleLogin = async () => {
            const authCode = searchParams.get("code");

            if (!authCode) {
                console.error("구글 로그인: code 값이 없습니다.");
                moveToPath("/login");
                return;
            }

            try {
                const accessToken = await getGoogleAccessToken(authCode);
                console.log("구글 액세스 토큰:", accessToken);

                const memberData = await getMemberWithGoogleAccessToken(accessToken);
                console.log("구글 회원 정보:", memberData);

                dispatch(login(memberData));

                if (memberData && !memberData.social) {
                    moveToPath("/");
                } else {
                    moveToPath("/member/modify");
                }
            } catch (err) {
                console.error("구글 로그인 처리 중 오류:", err);
                moveToPath("/login");
            }
        };

        handleGoogleLogin();
    }, [searchParams, dispatch, moveToPath]);

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>구글 로그인 처리 중...</h2>
            <p>잠시만 기다려 주세요.</p>
        </div>
    );
};

export default GoogleRedirectPage;
