import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const PREFIX = `${API_SERVER_HOST}/g2i4/admin/members`;

function buildParams({ page = 0, size = 10, sort, keyword } = {}) {
  const params = { page, size };
  if (sort) params.sort = sort;
  if (keyword && keyword.trim()) params.keyword = keyword.trim();
  return params;
}

/** 전체 회원(관리자 제외) */
export const fetchAllMembers = (opts) =>
  axios.get(`${PREFIX}/all`, { params: buildParams(opts) });

/** 물주 */
export const fetchOwners = (opts) =>
  axios.get(`${PREFIX}/owners`, { params: buildParams(opts) });

/** 차주 */
export const fetchCowners = (opts) =>
  axios.get(`${PREFIX}/cowners`, { params: buildParams(opts) });

/** 관리자 (ROLE_ADMIN) */
export const fetchAdmins = (opts) =>
  axios.get(`${PREFIX}/admins`, { params: buildParams(opts) });
