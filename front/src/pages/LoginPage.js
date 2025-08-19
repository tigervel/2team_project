// src/pages/LoginPage.jsx
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // 경로: src/pages → src/hooks
import LoginComponent from "../layout/component/users/LoginComponent";

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    // LoginComponent에서 { loginId, password, remember } 형태로 호출해 준다고 가정
    const handleSubmit = async ({ loginId, password, remember = true }) => {
        setError('');
        setLoading(true);
        try {
            await login({ loginId, password, remember }); // 토큰 저장까지 내부 처리
            navigate('/', { replace: true });            // 로그인 성공 → 메인으로
        } catch (e) {
            setError(e?.message || '로그인 실패');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed top-0 left-0 z-[1055] flex flex-col h-full w-full">
            <div className="flex flex-wrap w-full h-full justify-center items-center border-2">
                {/* LoginComponent가 아래 prop들을 사용하도록 구성되어 있으면 그대로 동작 */}
                <LoginComponent onSubmit={handleSubmit} loading={loading} error={error} />
            </div>
        </div>
    );
};

export default LoginPage;
