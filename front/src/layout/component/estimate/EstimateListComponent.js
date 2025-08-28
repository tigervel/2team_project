import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import useCustomMove from "../../../hooks/useCustomMove";
import { useEffect, useState } from "react";
import { getEstimateList, postAccepted, postRejected } from "../../../api/estimateApi/estimateApi";
import PageComponent from "../common/PageComponent";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRef } from "react";

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
  const { page, size, moveToList, refresh, setRefresh } = useCustomMove();
  const [serverData, setServerData] = useState(initState);
  const navigate = useNavigate();
  const { roles, email } = useSelector(state => state.login);
  const authChecked = useRef(false); // ✅ 실행 여부 플래그

  useEffect(() => {
    if (authChecked.current) {
      return; // ✅ 이미 체크했다면 중복 실행 방지
    }

    const isDriver = roles.includes("ROLE_DRIVER");
    const isAdmin = roles.includes("ROLE_ADMIN");

    if (!email || !isDriver || isAdmin) {
      authChecked.current = true; // ✅ 체크 완료로 표시
      alert("운전기사만 접근 가능합니다.");
      navigate("/", { replace: true });
      return;
    }

    try {
      getEstimateList({ page, size }).then(data => {
        setServerData(data)
      })
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/", { replace: true });
      } else if (status === 403) {
        alert("권한이 없습니다.");
        navigate("/", { replace: true });
      } else if (status === 404) {
        alert("기사 계정 정보가 없습니다.");
        navigate("/", { replace: true });
      } else {
        alert("목록을 불러오는 중 오류가 발생했습니다.");
      }
    }
  }, [page, size, refresh, navigate, roles, email]);

  const clickRejected = (esNo) => {
    postRejected(esNo).then(data => {
      console.log(data)
      setRefresh(!refresh)
    })
  }
  const clickAccepted = (esNo) => {
    postAccepted(esNo).then((data) => {
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
                  <Button variant="contained" color="success" onClick={() => clickAccepted(est.eno)}>수락</Button>
                </TableCell>
                <TableCell align="center">
                  <Button variant="outlined" color="error" onClick={() => clickRejected(est.eno)}>거절</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={2} display="flex" justifyContent="center" gap={1} sx={{ paddingBottom: 5 }}>
        <PageComponent serverData={serverData} movePage={moveToList} />
      </Box>
    </>
  );
};

export default EstimateListComponent;