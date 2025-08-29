// 권한 관리 유틸리티 - QABoard/NoBoard 전용

import { getCurrentUserFromToken } from './jwtUtils';

/**
 * 현재 사용자가 특정 권한을 가지고 있는지 확인
 * @param {string} role - 확인할 권한 (예: 'ADMIN', 'USER', 'ROLE_ADMIN')
 * @param {object} loginState - Redux 로그인 상태 (선택사항)
 * @returns {boolean} - 권한 보유 여부
 */
export const hasRole = (role, loginState = null) => {
  // 1순위: Redux 상태에서 확인
  if (loginState?.roles && Array.isArray(loginState.roles)) {
    return loginState.roles.includes(role) || 
           loginState.roles.includes(`ROLE_${role}`) ||
           loginState.roles.some(r => r.endsWith(role));
  }
  
  // 2순위: JWT 토큰에서 확인
  const userInfo = getCurrentUserFromToken();
  if (userInfo?.roles && Array.isArray(userInfo.roles)) {
    return userInfo.roles.includes(role) || 
           userInfo.roles.includes(`ROLE_${role}`) ||
           userInfo.roles.some(r => r.endsWith(role));
  }
  
  return false;
};

/**
 * 현재 사용자가 여러 권한 중 하나라도 가지고 있는지 확인
 * @param {string[]} roles - 확인할 권한 배열
 * @param {object} loginState - Redux 로그인 상태 (선택사항)
 * @returns {boolean} - 권한 보유 여부
 */
export const hasAnyRole = (roles, loginState = null) => {
  if (!Array.isArray(roles)) return false;
  return roles.some(role => hasRole(role, loginState));
};

/**
 * 관리자 권한 확인 (ADMIN 또는 ROLE_ADMIN)
 * @param {object} loginState - Redux 로그인 상태 (선택사항)
 * @returns {boolean} - 관리자 여부
 */
export const isAdmin = (loginState = null) => {
  return hasRole('ADMIN', loginState) || hasRole('ROLE_ADMIN', loginState);
};

/**
 * 일반 사용자 권한 확인 
 * @param {object} loginState - Redux 로그인 상태 (선택사항)
 * @returns {boolean} - 사용자 여부
 */
export const isUser = (loginState = null) => {
  return hasRole('USER', loginState) || hasRole('ROLE_USER', loginState);
};

/**
 * 화주 권한 확인
 * @param {object} loginState - Redux 로그인 상태 (선택사항)
 * @returns {boolean} - 화주 여부
 */
export const isShipper = (loginState = null) => {
  return hasRole('SHIPPER', loginState) || hasRole('ROLE_SHIPPER', loginState);
};

/**
 * 차주 권한 확인
 * @param {object} loginState - Redux 로그인 상태 (선택사항)
 * @returns {boolean} - 차주 여부
 */
export const isDriver = (loginState = null) => {
  return hasRole('DRIVER', loginState) || hasRole('ROLE_DRIVER', loginState);
};

/**
 * 현재 사용자의 모든 권한 반환
 * @param {object} loginState - Redux 로그인 상태 (선택사항)
 * @returns {string[]} - 권한 배열
 */
export const getCurrentUserRoles = (loginState = null) => {
  // 1순위: Redux 상태
  if (loginState?.roles && Array.isArray(loginState.roles)) {
    return loginState.roles;
  }
  
  // 2순위: JWT 토큰
  const userInfo = getCurrentUserFromToken();
  return userInfo?.roles || [];
};

/**
 * 권한 기반 액션 허용 여부 확인
 * @param {string} action - 액션 유형 ('create', 'edit', 'delete', 'reply')
 * @param {string} resourceType - 리소스 유형 ('qaboard', 'noboard')
 * @param {object} resourceData - 리소스 데이터 (작성자 정보 등)
 * @param {object} loginState - Redux 로그인 상태
 * @returns {boolean} - 액션 허용 여부
 */
export const canPerformAction = (action, resourceType, resourceData = {}, loginState = null) => {
  const currentUserId = loginState?.memberId || getCurrentUserFromToken()?.memberId;
  const userRoles = getCurrentUserRoles(loginState);
  const isAdminUser = isAdmin(loginState);
  
  switch (resourceType) {
    case 'noboard':
      // NoBoard는 모든 액션에 대해 관리자만 허용
      return isAdminUser;
      
    case 'qaboard':
      switch (action) {
        case 'create':
          // 문의 작성: 로그인한 사용자면 누구나
          return Boolean(currentUserId);
          
        case 'edit':
        case 'delete':
          // 수정/삭제: 본인 글이거나 관리자
          return isAdminUser || 
                 (currentUserId && resourceData.authorId === currentUserId);
                 
        case 'reply':
          // 답변 작성: 관리자만
          return isAdminUser;
          
        case 'view':
          // 조회: 공개글은 누구나, 비공개글은 본인이거나 관리자
          if (!resourceData.isPrivate) return true;
          return isAdminUser || 
                 (currentUserId && resourceData.authorId === currentUserId);
                 
        default:
          return false;
      }
      
    default:
      return false;
  }
};