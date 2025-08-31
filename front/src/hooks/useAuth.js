// src/hooks/useAuth.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStore } from '../lib/tokenStore';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '../slice/loginSlice';

const API_BASE =
    import.meta?.env?.VITE_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    'http://localhost:8080';

export default function useAuth() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const login = useCallback(async ({ loginId, password, remember = true }) => {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ loginId, password }),
        });

        if (!res.ok) {
            // 서버 응답을 최대한 읽어서 사용자 친화 메시지로 변환
            let msg = '';
            try {
                const ct = res.headers.get('content-type') || '';
                if (ct.includes('application/json')) {
                    const j = await res.json();
                    msg = j.message || j.error || '';
                } else {
                    msg = await res.text();
                }
            } catch { }

            if (res.status === 401) {
                throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
            }
            if (res.status === 429) {
                throw new Error('로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.');
            }
            throw new Error(msg || `로그인 실패 (code: ${res.status})`);
        }

        const data = await res.json(); // { accessToken, refreshToken, ... }
        tokenStore.save(
            { accessToken: data.accessToken, refreshToken: data.refreshToken },
            remember
        );

        // 선택: 즉시 Redux 로그인 상태 반영
        try {
            const payload = JSON.parse(
                decodeURIComponent(
                    atob(data.accessToken.split('.')[1])
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                )
            );
            dispatch(
                loginAction({
                    email: payload.email || payload.memEmail || '',
                    nickname: payload.name || '',
                    pw: '',
                    roles: payload.roles || payload.rolenames || ['USER'],
                    memberId: payload.memId || payload.cargoId || payload.sub || null,
                })
            );
        } catch {
            // payload 파싱 실패해도 무시
        }

        return data;
    }, [dispatch]);

    const logout = useCallback(
        async (to = '/login') => {
            try {
                await fetch(`${API_BASE}/api/auth/logout`, {
                    method: 'POST',
                    credentials: 'include',
                });
            } catch { }
            tokenStore.clear();
            navigate(to, { replace: true });
        },
        [navigate]
    );

    return { login, logout };
}
