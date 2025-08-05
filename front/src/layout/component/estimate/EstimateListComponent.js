import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import useCustomMove from "../../../hooks/useCustomMove";
import { useEffect, useState } from "react";
import { getEstimateList } from "../../../api/estimateApi/estimateApi";
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
        getEstimateList({page,size}).then(data=>{
            console.log(data)
            setServerData(data)
        })
    },[page,size,refresh]);
 

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
              <TableCell align="center">{est.distanceKM}</TableCell>
              <TableCell align="center">{est.cargoWeight}</TableCell>
              <TableCell align="center">{est.startTime}</TableCell>
              <TableCell align="center">{est.cargoType}</TableCell>
              <TableCell align="center">{est.totalCost}</TableCell>
              <TableCell align="center">
                <Button variant="contained" color="success">수락</Button>
              </TableCell>
              <TableCell align="center">
                <Button variant="outlined" color="error">거절</Button>
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