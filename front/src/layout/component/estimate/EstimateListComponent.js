import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import useCustomMove from "../../../hooks/useCustomMove";
import { useEffect, useState } from "react";
import { getEstimateList, postAccepted, postRejected } from "../../../api/estimateApi/estimateApi";
import PageComponent from "../common/PageComponent";

const initState = {
    dtoList: [],
    pageNumList: [],
    pageRequestDTO: null,
    prev: false,
    next: false,
    totalCount: 0,
    prevPage: 0,
    nextPage: 0,
    tatalPage: 0,
    current: 0
}

const EstimateListComponent = () => {
    const {page, size ,moveToList, refresh, setRefresh } =useCustomMove();
    const[serverData,setServerData] = useState(initState);

    useEffect(()=>{
      try{
        getEstimateList({page,size}).then(data=>{
            setServerData(data)
        })
      }catch(error){
        alert("화물 기사만 이용할 수 있습니다.")
        console.log(error)
        return
      }
    },[page,size,refresh]);

    const clickRejected = (esNo) =>{
      postRejected(esNo).then(data=>{
        console.log(data)
        setRefresh(!refresh)
      })
    }
    const clickAccepted =(esNo) =>{
      postAccepted(esNo).then((data)=>{
        console.log(data)
         setRefresh(!refresh)
      })
    }
 

  return (
    <>
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ backgroundColor: '#EEE0F8' }}>
          <TableRow>
            <TableCell align="center">견적번호</TableCell>
            <TableCell align="center">출발 - 도착</TableCell>
            <TableCell align="center">거리(KM)</TableCell>
            <TableCell align="center">무게(KG)</TableCell>
            <TableCell align="center">출발 날짜</TableCell>
            <TableCell align="center">화물 종류</TableCell>
            <TableCell align="center">금액</TableCell>
            <TableCell align="center">승락 여부</TableCell>
            <TableCell align="center"></TableCell>
            
          </TableRow>
        </TableHead>
        <TableBody>
          {serverData.dtoList.map((est, idx) => (
            <TableRow key={est.eno}>
              <TableCell align="center">No.{est.eno}</TableCell>
              <TableCell align="center">{est.route}</TableCell>
              <TableCell align="center">{est.distanceKm}</TableCell>
              <TableCell align="center">{est.cargoWeight}</TableCell>
              <TableCell align="center">{est.startTime}</TableCell>
              <TableCell align="center">{est.cargoType}</TableCell>
              <TableCell align="center">{est.totalCost}</TableCell>
              <TableCell align="center">
                <Button variant="contained" color="success" onClick={()=>clickAccepted(est.eno)}>수락</Button>
              </TableCell>
              <TableCell align="center">
                <Button variant="outlined" color="error" onClick={()=>clickRejected(est.eno)}>거절</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
     <Box mt={2} display="flex" justifyContent="center" gap={1} sx={{paddingBottom:5}}>
          <PageComponent serverData={serverData} movePage={moveToList}/>
      </Box>
      </>
  );
};

export default EstimateListComponent;