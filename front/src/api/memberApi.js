import axios from "axios";
import { API_SERVER_HOST } from "./serverConfig";

const myhost = `${API_SERVER_HOST}/api/users`

export const loginPost = async (loginParam) => {
    const form = new FormData();

    form.append('username', loginParam.id)
    form.append('password', loginParam.pw)

    const res = await axios.post(`${myhost}/login`, form);
    return res.data;
}