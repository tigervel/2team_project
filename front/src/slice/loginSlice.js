// src/slice/loginSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// 백엔드 베이스 URL
const API_BASE =
    import.meta?.env?.VITE_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8080";

// 초기 상태 (기존 필드 유지 + 상태/토큰 필드 추가)
const initState = {
    email: "",
    roles: ["USER"],

    memberId: null,

    status: "idle",      // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,         // 에러 메시지
    tokens: null,        // { tokenType, accessToken, refreshToken, expiresIn }
};

// ✅ 로그인 API 호출 (정규화해서 loginId/password 추출)
async function loginApi(param) {
    const loginId =
        param?.loginId ?? param?.id ?? param?.email ?? param?.memId ?? "";
    const password =
        param?.password ?? param?.pw ?? param?.password1 ?? "";

    const { data } = await axios.post(
        `${API_BASE}/api/auth/login`,
        { loginId, password },
        { headers: { "Content-Type": "application/json" } }
    );
    // data: { tokenType, accessToken, refreshToken, expiresIn }
    return data;
}

// 비동기 thunk (이름은 기존 유지)
export const loginPostAsync = createAsyncThunk(
    "loginPostAsync",
    async (param, { rejectWithValue }) => {
        try {
            const data = await loginApi(param);
            return data;
        } catch (err) {
            const msg =
                err?.response?.data?.message ??
                err?.response?.data?.error ??
                err?.message ??
                "로그인 실패";
            return rejectWithValue(msg);
        }
    }
);

// slice
const loginSlice = createSlice({
    name: "LoginSlice",
    initialState: initState,
    reducers: {
        // (선택) 수동 로그인 상태 세팅 - 기존 호환 유지
        login: (state, action) => {
            const d = action.payload || {};
            // roles가 배열인지 확인하고, 아니면 배열로 만듭니다.
            const newRoles = Array.isArray(d.roles) ? d.roles : (d.role ? [d.role] : state.roles);
            return {
                ...state,
                email: d.email ?? state.email ?? "",
                roles: newRoles,
                memberId: d.memberId ?? d.id ?? state.memberId ?? null,
            };
        },
        logout: () => {
            // 토큰은 훅(useCustomLogin)에서 지우고, 상태만 리셋
            return { ...initState };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginPostAsync.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(loginPostAsync.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.error = null;
                state.tokens = action.payload; // { tokenType, accessToken, refreshToken, expiresIn }
                // 이메일/역할 정보는 토큰 응답에 없으므로 유지
            })
            .addCase(loginPostAsync.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || action.error?.message || "로그인 실패";
            });
    },
});

export const { login, logout } = loginSlice.actions;
export default loginSlice.reducer;
