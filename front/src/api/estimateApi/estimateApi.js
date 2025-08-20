import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const prefix = `${API_SERVER_HOST}/g2i4/estimate`


export const postAdd = async (estimateDTO) => {
  const accessToken = localStorage.getItem("accessToken");
  const res = await axios.post(`${prefix}/`, estimateDTO, {
    headers: {
      Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer로 붙여 전송
      "Content-Type": "application/json",
    },
    withCredentials: true
  })

  return res.data;
}
export const getEstimateList = async (pageParam) => {
  const { page, size } = pageParam;
  const accessToken = localStorage.getItem("accessToken");
  const res = await axios.get(`${prefix}/list`, { 
    params: { page: page, size: size },
   headers: {
      Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer로 붙여 전송
      "Content-Type": "application/json",
    }, })
  return res.data;
}

export const postRejected = async (estimateParam) => {
  const res = await axios.post(`${prefix}/rejected`, { estimateNo: estimateParam })
  return res.data;
}
export const postAccepted = async (estimateParam) => {
  const res = await axios.post(`${prefix}/accepted`, { estimateNo: estimateParam })
  return res.data;
}

export const postSaveEs = async (estimateDTO) => {
  const res = await axios.post(`${prefix}/savedreft`, estimateDTO,)
  return res;
}

export const getMyAllEstimateList = async ({ page, size }) => {
  const res = await axios.get(`${prefix}/my-all-list`, {
    params: { page, size },
    withCredentials: true,
  });
  return res.data;
};
// 결제 없는 내 견적 리스트 (GET)
export const getMyUnpaidEstimateList = async ({ page, size }) => {
  const res = await axios.get(`${prefix}/unpaidlist`, {
    params: { page, size },
    withCredentials: true,
  });
  return res.data; // List<EstimateDTO>
};

export const postSearchFeesBasic = async () => {
  const res = await axios.post(`${prefix}/searchfeesbasic`)
  return res.data;
}
export const getMyPaidEstimateList = async ({ page, size }) => {
  const res = await axios.get(`${prefix}/paidlist`, {
    params: { page, size },
    withCredentials: true,
  });
  return res.data;
}

export const postSearchFeesExtra = async () => {
  const res = await axios.post(`${prefix}/searchfeesextra`)
  return res.data;
}