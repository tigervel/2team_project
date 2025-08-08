import axios from "axios";
import { API_SERVER_HOST } from "../memberApi";

const prefix = `${API_SERVER_HOST}/g2i4/order`

export const postOrderPome = async (matchingNo) =>{
    const res = await axios.post(`${prefix}/`,{mcNo:matchingNo})
    return res.data;
}