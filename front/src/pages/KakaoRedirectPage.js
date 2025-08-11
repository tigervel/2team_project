import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAccessToken, getMemberWithAccessToken } from "../api/getKakaoLoginLink";
import { useDispatch } from "react-redux";
import { login } from "../slice/loginSlice";
import useCustomLogin from "../hooks/useCustomLogin";

const KakaoRedirectPage = () => {
    // 파라미터로 오는 토큰 값을 get
    const[searchParams] = useSearchParams();

    const authCode = searchParams.get('code')

    //slice 의 login 에게 요청전달을 통한 로그인 실현을 함..
    const dispatch = useDispatch();

    const { moveToPath } = useCustomLogin();

    useEffect(()=>{
        getAccessToken(authCode)
        .then(data =>{
            console.log(data)

            getMemberWithAccessToken(data)
            .then(result=>{
                console.log(result);
                dispatch(login(result))

                // 소셜 회원인지 기존 회원인지 검증
                if(result && !result.social){
                    // 기존 회원
                    moveToPath("/")
                } else {
                    moveToPath("/member/modify")
                    // 정보 수정하는 페이지로 리턴
                }
            })
        })
    },[authCode])

    return(
        <div>
            <div>Kakao Login Redirect</div>
            <div>{authCode}</div>
        </div>
    )
}
export default KakaoRedirectPage;