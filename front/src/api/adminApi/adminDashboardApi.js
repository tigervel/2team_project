import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const DASH_BOARD = `${API_SERVER_HOST}/g2i4/admin`;

export const fetchDashboardData = async () => {
    try {
        const response = await axios.get(`${DASH_BOARD}/dashboard`);
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
    }
};