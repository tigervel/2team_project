// src/api/axios.js
import axios from "axios";
import { API_SERVER_HOST } from "./serverConfig";

axios.defaults.baseURL = API_SERVER_HOST;
axios.defaults.withCredentials = true;  // ✅ 쿠키 자동 전송

export default axios;
