// JWT 토큰 유틸리티 - 실제 프로덕션 환경용

/**
 * JWT 토큰을 안전하게 디코딩하여 페이로드 반환
 * @param {string} token - JWT 토큰
 * @returns {object|null} - 디코딩된 페이로드 또는 null
 */
export const decodeJWT = (token) => {
  if (!token || typeof token !== 'string') return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT format - expected 3 parts');
      return null;
    }
    
    const payload = parts[1];
    // Base64 URL 디코딩 (패딩 처리 포함)
    const paddedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = atob(paddedPayload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
};

/**
 * JWT 토큰에서 사용자 정보와 권한 추출
 * @param {string} token - JWT 토큰
 * @returns {object|null} - 사용자 정보 객체
 */
export const extractUserInfoFromJWT = (token) => {
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  // roles 배열 추출 (다양한 클레임 이름 지원)
  let roles = [];
  if (Array.isArray(payload.roles)) {
    roles = payload.roles;
  } else if (Array.isArray(payload.authorities)) {
    roles = payload.authorities;
  } else if (Array.isArray(payload.roleNames)) {
    roles = payload.roleNames;
  } else if (payload.role) {
    roles = [payload.role];
  } else {
    roles = ['USER']; // 기본값
  }
  
  return {
    subject: payload.sub || null,
    email: payload.email || null,
    nickname: payload.nickname || payload.name || payload.sub || null,
    roles: roles,
    memberId: payload.memId || payload.sub || null,
    issuer: payload.iss || null,
    issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
    expiresAt: payload.exp ? new Date(payload.exp * 1000) : null
  };
};

/**
 * JWT 토큰 만료 확인
 * @param {string} token - JWT 토큰
 * @returns {boolean} - 유효 여부
 */
export const isJWTExpired = (token) => {
  const userInfo = extractUserInfoFromJWT(token);
  if (!userInfo || !userInfo.expiresAt) return true;
  
  // 5분 여유를 두고 만료 체크 (토큰 갱신 시간 고려)
  const bufferTime = 5 * 60 * 1000; // 5분
  return userInfo.expiresAt.getTime() <= Date.now() + bufferTime;
};

/**
 * 저장된 토큰 가져오기
 * @returns {object} - 토큰 정보
 */
export const getStoredTokens = () => {
  const accessToken = 
    localStorage.getItem("accessToken") || 
    sessionStorage.getItem("accessToken");
  const refreshToken = 
    localStorage.getItem("refreshToken") || 
    sessionStorage.getItem("refreshToken");
    
  return { accessToken, refreshToken };
};

/**
 * 현재 저장된 토큰에서 사용자 정보 추출
 * @returns {object|null} - 사용자 정보 또는 null
 */
export const getCurrentUserFromToken = () => {
  const { accessToken } = getStoredTokens();
  if (!accessToken || isJWTExpired(accessToken)) return null;
  
  return extractUserInfoFromJWT(accessToken);
};