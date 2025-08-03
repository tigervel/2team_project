// QA 게시판 권한 관련 유틸리티 함수들

/**
 * 비공개 글의 가시성을 결정하는 함수
 * @param {Object} item - Q&A 게시글 아이템
 * @param {boolean} isAdmin - 관리자 여부
 * @param {string} currentUserId - 현재 로그인한 사용자 ID
 * @returns {Object} { canView: boolean, showContent: boolean, displayTitle: string }
 */
export const getPostVisibility = (item, isAdmin, currentUserId) => {
  // 공개 글인 경우 모든 사용자가 볼 수 있음
  if (!item.isPrivate) {
    return {
      canView: true,
      showContent: true,
      displayTitle: item.title
    };
  }

  // 비공개 글인 경우
  // 1. 관리자는 모든 비공개 글을 볼 수 있음
  if (isAdmin) {
    return {
      canView: true,
      showContent: true,
      displayTitle: item.title
    };
  }

  // 2. 작성자 본인은 자신의 비공개 글을 볼 수 있음
  // authorId 필드가 없으면 author 이름으로 비교 (임시)
  const isAuthor = item.authorId === currentUserId || 
                   (item.author && currentUserId && item.author.includes(currentUserId));
  
  if (isAuthor) {
    return {
      canView: true,
      showContent: true,
      displayTitle: item.title
    };
  }

  // 3. 그 외의 사용자는 "비공개 문의 입니다" 메시지만 표시
  return {
    canView: true,
    showContent: false,
    displayTitle: '비공개 문의 입니다'
  };
};

/**
 * 게시글 액션 버튼의 권한을 확인하는 함수
 * @param {Object} item - Q&A 게시글 아이템
 * @param {boolean} isAdmin - 관리자 여부
 * @param {string} currentUserId - 현재 로그인한 사용자 ID
 * @returns {Object} { canEdit: boolean, canDelete: boolean, canReply: boolean, canEditAsAdmin: boolean, canDeleteAsAdmin: boolean, canEditResponse: boolean }
 */
export const getActionPermissions = (item, isAdmin, currentUserId) => {
  const isAuthor = item.authorId === currentUserId || 
                   (item.author && currentUserId && item.author.includes(currentUserId));

  return {
    canEdit: isAuthor, // 작성자만 수정 가능
    canDelete: isAuthor, // 작성자만 삭제 가능
    canReply: isAdmin && !item.adminResponse, // 관리자만 답변 가능, 이미 답변이 있으면 불가
    // 새로 추가된 관리자 전용 권한
    canEditAsAdmin: isAdmin && !isAuthor, // 관리자가 타인의 글을 수정
    canDeleteAsAdmin: isAdmin && !isAuthor, // 관리자가 타인의 글을 삭제
    canEditResponse: isAdmin && item.adminResponse // 관리자가 답변을 수정
  };
};

/**
 * 게시글 내용 표시 여부를 확인하는 함수
 * @param {Object} item - Q&A 게시글 아이템
 * @param {boolean} isAdmin - 관리자 여부
 * @param {string} currentUserId - 현재 로그인한 사용자 ID
 * @returns {boolean} 내용을 표시할지 여부
 */
export const shouldShowContent = (item, isAdmin, currentUserId) => {
  const { showContent } = getPostVisibility(item, isAdmin, currentUserId);
  return showContent;
};

/**
 * 게시글 제목을 가져오는 함수 (권한에 따라 다른 제목 반환)
 * @param {Object} item - Q&A 게시글 아이템
 * @param {boolean} isAdmin - 관리자 여부
 * @param {string} currentUserId - 현재 로그인한 사용자 ID
 * @returns {string} 표시할 제목
 */
export const getDisplayTitle = (item, isAdmin, currentUserId) => {
  const { displayTitle } = getPostVisibility(item, isAdmin, currentUserId);
  return displayTitle;
};