import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoginComponent from '../layout/component/users/LoginComponent';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const prefillId = params.get('loginId') || '';
    const redirectTo = params.get('redirectTo') || '/';

    const handleSubmit = React.useCallback(
        async ({ loginId, password, remember = true }) => {
            setError('');
            setLoading(true);
            try {
                await login({ loginId, password, remember });
                navigate(redirectTo, { replace: true });
            } catch (e) {
                const msg = e?.message || '로그인 실패';
                alert(msg);
                setError(msg);
            } finally {
                setLoading(false);
            }
        },
        [login, navigate, redirectTo]
    );

    const handleFindId = React.useCallback(() => {
        navigate(`/find-id?redirectTo=${encodeURIComponent(redirectTo)}`);
    }, [navigate, redirectTo]);

    const handleFindPassword = React.useCallback(
        (loginIdPrefill = '') => {
            const qs = loginIdPrefill ? `?loginId=${encodeURIComponent(loginIdPrefill)}` : '';
            navigate(`/find-password${qs}`);
        },
        [navigate]
    );

    React.useEffect(() => {
        return () => setError('');
    }, []);

    return (
        <div className="fixed top-0 left-0 z-[1055] flex flex-col h-full w-full">
            <div className="flex flex-wrap w-full h-full justify-center items-center border-2">
                <LoginComponent
                    onSubmit={handleSubmit}
                    onFindId={handleFindId}
                    onFindPassword={handleFindPassword}
                    loading={loading}
                    error={error}
                    initialLoginId={prefillId}
                />
            </div>
        </div>
    );
};

export default LoginPage;