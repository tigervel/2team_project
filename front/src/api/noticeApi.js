import axios from "axios";
import { API_SERVER_HOST } from "./serverConfig";

const noticeHost = `${API_SERVER_HOST}/api/notices`;

export const getNoticeList = async (params = {}) => {
    const { keyword, page = 0, size = 10 } = params;
    
    const queryParams = new URLSearchParams();
    if (keyword && keyword.trim() !== '') queryParams.append('keyword', keyword.trim());
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    
    const url = `${noticeHost}?${queryParams.toString()}`;
    const res = await axios.get(url);
    return res.data;
};

export const getNoticeDetail = async (noticeId) => {
    const res = await axios.get(`${noticeHost}/${noticeId}`);
    return res.data;
};

export const createNotice = async (noticeData, userInfo) => {
    const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': userInfo.userId,
        'X-User-Name': encodeURIComponent(userInfo.userName || '')
    };
    const res = await axios.post(`${noticeHost}`, noticeData, { headers });
    return res.data;
};

export const updateNotice = async (noticeId, noticeData, userInfo) => {
    const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': userInfo.userId,
        'X-User-Name': encodeURIComponent(userInfo.userName || '')
    };
    const res = await axios.put(`${noticeHost}/${noticeId}`, noticeData, { headers });
    return res.data;
};

export const deleteNotice = async (noticeId, userInfo) => {
    const headers = {
        'X-User-Id': userInfo.userId,
        'X-User-Name': encodeURIComponent(userInfo.userName || '')
    };
    const res = await axios.delete(`${noticeHost}/${noticeId}`, { headers });
    return res.data;
};