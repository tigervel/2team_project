import { API_SERVER_HOST } from "./serverConfig";

const API_BASE =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
    process.env.REACT_APP_API_BASE ||
    API_SERVER_HOST;

export const getOAuthStartUrl = (provider /* 'google' | 'naver' | 'kakao' */) =>
    `${API_BASE}/oauth2/authorization/${provider}`;