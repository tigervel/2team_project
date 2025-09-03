import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const prefix = `${API_SERVER_HOST}/g2i4/subpath/order`;

export const postOrderPome = async (matchingNo) => {
  const res = await axios.post(
    `${prefix}/view`,   
    { mcNo: matchingNo },   
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
};

export const postOrderCreate = async (orderSheetDTO) => {
  const res = await axios.post(
    `${prefix}/create`,
    orderSheetDTO,
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
};
