import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const PREFIX = `${API_SERVER_HOST}/g2i4/admin/delivery`;

export async function searchUserForDeliveryPage(query) {
  const { data } = await axios.get(`${PREFIX}/user-search`, {
    params: { query },
    withCredentials: true,
  });
  return data;
}
