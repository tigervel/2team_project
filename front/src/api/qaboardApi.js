import axios from "axios";

// Backend API Server Host
export const API_SERVER_HOST = "http://localhost:8080";

const qaHost = `${API_SERVER_HOST}/api/qaboard`;

// 게시글 목록 조회
export const getPostList = async (params = {}, userInfo = {}) => {
    const { category, keyword, page = 0, size = 10 } = params;
    
    const queryParams = new URLSearchParams();
    if (category && category !== 'all') queryParams.append('category', category);
    if (keyword && keyword.trim() !== '') queryParams.append('keyword', keyword.trim());
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    
    // 사용자 정보를 헤더에 추가
    const headers = {};
    if (userInfo.userId) {
        headers['X-User-Id'] = userInfo.userId;
    }
    if (userInfo.userName) {
        headers['X-User-Name'] = encodeURIComponent(userInfo.userName || ''); // URL 인코딩으로 한국어 문자 처리
    }
    
    const url = `${qaHost}/posts?${queryParams.toString()}`;
    const res = await axios.get(url, { headers });
    return res.data;
};

// 게시글 상세 조회
export const getPostDetail = async (postId, userInfo = {}) => {
    // 사용자 정보를 헤더에 추가
    const headers = {};
    if (userInfo.userId) {
        headers['X-User-Id'] = userInfo.userId;
    }
    if (userInfo.userName) {
        headers['X-User-Name'] = encodeURIComponent(userInfo.userName || ''); // URL 인코딩으로 한국어 문자 처리
    }
    
    const res = await axios.get(`${qaHost}/posts/${postId}`, { headers });
    return res.data;
};

// 게시글 생성
export const createPost = async (postData, userInfo) => {
    const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': userInfo.userId,
        'X-User-Name': encodeURIComponent(userInfo.userName || '') // URL 인코딩으로 한국어 문자 처리
    };
    
    const res = await axios.post(`${qaHost}/posts`, postData, { headers });
    return res.data;
};

// 게시글 수정
export const updatePost = async (postId, postData, userInfo) => {
    const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': userInfo.userId,
        'X-User-Name': encodeURIComponent(userInfo.userName || '') // URL 인코딩으로 한국어 문자 처리
    };
    
    const res = await axios.put(`${qaHost}/posts/${postId}`, postData, { headers });
    return res.data;
};

// 게시글 삭제
export const deletePost = async (postId, userInfo) => {
    const headers = {
        'X-User-Id': userInfo.userId,
        'X-User-Name': encodeURIComponent(userInfo.userName || '') // URL 인코딩으로 한국어 문자 처리
    };
    
    const res = await axios.delete(`${qaHost}/posts/${postId}`, { headers });
    return res.data;
};

// 관리자 답변 생성
export const createAdminResponse = async (postId, responseData, userInfo) => {
    const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': userInfo.userId,
        'X-User-Name': encodeURIComponent(userInfo.userName || '') // URL 인코딩으로 한국어 문자 처리
    };
    
    const res = await axios.post(`${qaHost}/posts/${postId}/response`, responseData, { headers });
    return res.data;
};

// 관리자 답변 수정
export const updateAdminResponse = async (postId, responseData, userInfo) => {
    const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': userInfo.userId,
        'X-User-Name': encodeURIComponent(userInfo.userName || '') // URL 인코딩으로 한국어 문자 처리
    };
    
    const res = await axios.put(`${qaHost}/posts/${postId}/response`, responseData, { headers });
    return res.data;
};

// 관리자 답변 삭제
export const deleteAdminResponse = async (postId, userInfo) => {
    const headers = {
        'X-User-Id': userInfo.userId,
        'X-User-Name': encodeURIComponent(userInfo.userName || '') // URL 인코딩으로 한국어 문자 처리
    };
    
    const res = await axios.delete(`${qaHost}/posts/${postId}/response`, { headers });
    return res.data;
};

// 내 게시글 목록 조회
export const getMyPosts = async (userInfo, params = {}) => {
    const { page = 0, size = 10 } = params;
    
    const headers = {
        'X-User-Id': userInfo.userId,
        'X-User-Name': encodeURIComponent(userInfo.userName || '') // URL 인코딩으로 한국어 문자 처리
    };
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    
    const url = `${qaHost}/posts/my?${queryParams.toString()}`;
    const res = await axios.get(url, { headers });
    return res.data;
};