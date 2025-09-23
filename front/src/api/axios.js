// src/api/axios.js
import axios from "axios";

axios.defaults.baseURL = "http://10.0.2.2:8080";
axios.defaults.withCredentials = true;  // ✅ 쿠키 자동 전송

export default axios;
