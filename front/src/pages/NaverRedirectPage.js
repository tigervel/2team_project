import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../slice/loginSlice"; // Redux slice 경로 확인 필요
import useCustomLogin from "../hooks/useCustomLogin"; // 경로 확인 필요
import { getNaverAccessToken, getMemberWithNaverAccessToken } from "../api/getNaverLoginLink";

const NaverRedirectPage = () => {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { moveToPath } = useCustomLogin();

    useEffect(() => {
        const authCode = searchParams.get("code");
        const state = searchParams.get("state");

        if (!authCode || !state) {
            console.error("네이버 로그인: code 또는 state 값이 없습니다.");
            moveToPath("/login");
            return;
        }

        getNaverAccessToken(authCode, state)
            .then(accessToken => {
                console.log("네이버 액세스 토큰:", accessToken);

                return getMemberWithNaverAccessToken(accessToken);
            })
            .then(memberData => {
                console.log("네이버 회원 정보:", memberData);

                dispatch(login(memberData));

                if (memberData && !memberData.social) {
                    moveToPath("/");
                } else {
                    moveToPath("/member/modify");
                }
            })
            .catch(err => {
                console.error("네이버 로그인 처리 중 오류:", err);
                moveToPath("/login");
            });
    }, [searchParams, dispatch, moveToPath]);

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>네이버 로그인 처리 중...</h2>
            <p>잠시만 기다려 주세요.</p>
        </div>
    );
};

export default NaverRedirectPage;
