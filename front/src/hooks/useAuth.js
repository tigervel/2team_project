// src/hooks/useAuth.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStore } from '../lib/tokenStore';

const API_BASE = import.meta?.env?.VITE_API_BASE || process.env.REACT_APP_API_BASE || 'http://localhost:8080';

export default function useAuth() {
    const navigate = useNavigate();

    const login = useCallback(async ({ loginId, password, remember = true }) => {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loginId, password })
        });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || '로그인 실패');
        }
        const data = await res.json(); // { tokenType, accessToken, refreshToken, expiresIn }
        tokenStore.save({ accessToken: data.accessToken, refreshToken: data.refreshToken }, remember);
        return data;
    }, []);

    const logout = useCallback(async (to = '/login') => {
        try {
            await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch { }
        tokenStore.clear();
        navigate(to, { replace: true });
    }, [navigate]);

    return { login, logout };
}
