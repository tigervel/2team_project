import axios from "axios";

// Backend API Server Host
export const API_SERVER_HOST = "http://localhost:8080";

const noticeHost = `${API_SERVER_HOST}/api/notices`;

// 공지사항 목록 조회
export const getNotices = async (params = {}) => {
    const { keyword, page = 0, size = 10 } = params;
    
    const queryParams = new URLSearchParams();
    if (keyword && keyword.trim() !== '') queryParams.append('keyword', keyword.trim());
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    
    const url = `${noticeHost}?${queryParams.toString()}`;
    const res = await axios.get(url);
    return res.data;
};

// 공지사항 상세 조회
export const getNoticeDetail = async (noticeId) => {
    const res = await axios.get(`${noticeHost}/${noticeId}`);
    return res.data;
};

// 공지사항 생성 (관리자 전용)
export const createNotice = async (noticeData, userInfo) => {
    const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': userInfo.userId,
        'X-User-Name': encodeURIComponent(userInfo.userName || '') // URL 인코딩으로 한국어 문자 처리
    };
    
    const res = await axios.post(noticeHost, noticeData, { headers });
    return res.data;
};

// 공지사항 수정 (관리자 전용)
export const updateNotice = async (noticeId, noticeData, userInfo) => {
    const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': userInfo.userId,
        'X-User-Name': encodeURIComponent(userInfo.userName || '') // URL 인코딩으로 한국어 문자 처리
    };
    
    const res = await axios.put(`${noticeHost}/${noticeId}`, noticeData, { headers });
    return res.data;
};

// 공지사항 삭제 (관리자 전용)
export const deleteNotice = async (noticeId, userInfo) => {
    const headers = {
        'X-User-Id': userInfo.userId,
        'X-User-Name': encodeURIComponent(userInfo.userName || '') // URL 인코딩으로 한국어 문자 처리
    };
    
    const res = await axios.delete(`${noticeHost}/${noticeId}`, { headers });
    return res.data;
};