import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const prefix = `${API_SERVER_HOST}/g2i4/estimate`


export const postAdd = async (estimateDTO)=>{
    
    const res = await axios.post(`${prefix}/`,estimateDTO,{
        withCredentials:true
    })

    return res.data;
}
export const getEstimateList = async (pageParam) =>{
    const {page,size} = pageParam;
    const res = await axios.get(`${prefix}/list`,{params:{page:page,size:size}})
    return res.data;
}