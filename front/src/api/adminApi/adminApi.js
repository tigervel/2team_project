// src/api/adminApi.js
import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const FEES_PREFIX = `${API_SERVER_HOST}/api/admin/fees`;

// 행 목록
export const getBasicRows = () => axios.get(`${FEES_PREFIX}/basic/rows`);
export const getExtraRows = () => axios.get(`${FEES_PREFIX}/extra/rows`);

// 행 추가
export const addBasicRow = (name) => axios.post(`${FEES_PREFIX}/basic/rows`, { name });
export const addExtraRow = (name) => axios.post(`${FEES_PREFIX}/extra/rows`, { name });

// 행 삭제
export const deleteBasicRow = (name) => axios.delete(`${FEES_PREFIX}/basic/rows/${encodeURIComponent(name)}`);
export const deleteExtraRow = (name) => axios.delete(`${FEES_PREFIX}/extra/rows/${encodeURIComponent(name)}`);

// 그리드 조회
export const fetchFeesBasic = () => axios.get(`${FEES_PREFIX}/basic`);
export const fetchFeesExtra = () => axios.get(`${FEES_PREFIX}/extra`);

// 셀 저장
export const saveFeeBasicCell = ({ category, distance, price }) =>
  axios.post(`${FEES_PREFIX}/basic`, { category, distance, price });

export const saveFeeExtraCell = ({ category, distance, price }) =>
  axios.post(`${FEES_PREFIX}/extra`, { category, distance, price });
