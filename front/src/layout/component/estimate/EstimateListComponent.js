import { Box, Button, Dialog, DialogActions, DialogContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import useCustomMove from "../../../hooks/useCustomMove";
import { useEffect, useState, useRef } from "react";
import { getEstimateList, postAccepted, postRejected } from "../../../api/estimateApi/estimateApi";
import PageComponent from "../common/PageComponent";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

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
  const [openEstimateListAccept, setOpenEstimateListAccept] = useState(false)
  const [selectedEno, setSelectedEno] = useState(null)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    if (authChecked.current) {
      return; // ✅ 이미 체크했다면 중복 실행 방지
    }

    const isDriver = roles.includes("ROLE_DRIVER");
    const isAdmin = roles.includes("ROLE_ADMIN");

    if (!email || !isDriver || isAdmin) {
      authChecked.current = true; // ✅ 체크 완료로 표시
      alert("차주회원만 이용이 가능합니다.");
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

  const handleCancelClose = () => {
    setOpenEstimateListAccept(false);
    setSelectedEno(null);
  };

  const clickRejected = (esNo) => {
    postRejected(esNo).then(data => {
      console.log(data)
      setRefresh(!refresh)
    })
  }
  const clickAccepted = (enNo) => {
    setOpenEstimateListAccept(true)
    setSelectedEno(enNo);
  }
  const handleClickFinalCheck = async () => {
    if (!selectedEno || accepting) return;
    try {
      setAccepting(true);
      await postAccepted(selectedEno);
      alert('견적이 수락되었습니다')
      setOpenEstimateListAccept(false);
      setSelectedEno(null);
      setRefresh(!refresh);
    } catch (e) {
      alert("수락 처리 중 오류가 발생했습니다.");
    } finally {
      setAccepting(false);
    }
  

  }
  const renderData =(list)=>{
    if (!list|| list.length === 0){
      return (
        <TableRow>
          <TableCell colSpan={9} align="center">견적의뢰가 없습니다</TableCell>
        </TableRow>
      )
    }
    return list.map((estimate, idx) => (
              <TableRow key={estimate.eno}>
                <TableCell align="center">No.{estimate.eno}</TableCell>
                <TableCell align="center">{estimate.route}</TableCell>
                <TableCell align="center">{estimate.distanceKm}</TableCell>
                <TableCell align="center">{estimate.cargoWeight}</TableCell>
                <TableCell align="center">{dayjs(estimate.startTime).format('YYYY년 MM월 DD일 A hh:mm')}</TableCell>
                <TableCell align="center">{estimate.cargoType}</TableCell>
                <TableCell align="center">{estimate.totalCost}</TableCell>
                <TableCell align="center">
                  <Button variant="contained" color="success" onClick={() => clickAccepted(estimate.eno)}>수락</Button>
                </TableCell>
                <TableCell align="center">
                  <Button variant="outlined" color="error" onClick={() => clickRejected(estimate.eno)}>거절</Button>
                </TableCell>
              </TableRow>
            ))
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
            {renderData(serverData.dtoList)}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={2} display="flex" justifyContent="center" gap={1} sx={{ paddingBottom: 5 }}>
        <PageComponent serverData={serverData} movePage={moveToList} />
      </Box>


      <Dialog
        open={openEstimateListAccept}
        onClose={handleCancelClose}
        PaperProps={{
          sx: {
            width: 400,
            height: 150,
            borderRadius: 2,
            p: 2,
          },
        }}
      >

        <DialogContent >
          <Typography fontSize={20} fontWeight='bold'>해당 견적을 수락하시겠습니까?</Typography>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickFinalCheck} color="error" disabled={accepting}>
            확인
          </Button>
          <Button onClick={handleCancelClose} color="inherit">
            아니요
          </Button>

        </DialogActions>
      </Dialog>
    </>
  );
};

export default EstimateListComponent;