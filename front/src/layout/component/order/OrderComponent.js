import React from 'react';
import {
    Box,
    Typography,
    Grid,
    TextField,
    MenuItem,
    Button,
    Divider,
    Paper,
    Select,
    InputLabel,
    FormControl,
} from '@mui/material';

const OrderComponent = () => {
    return (
        <Box p={4}>
    <Typography variant="h4" mb={4}>
        주문서 작성
      </Typography>

      {/* 출발지 정보 */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>출발지 정보 입력</Typography>

        <Grid container spacing={2}>
          {/* 왼쪽 30% 라벨 영역 */}
          <Grid item xs={12} md={3}>
            <Grid container spacing={4} direction="column">
              <Grid item>
                <Typography variant="subtitle1" align="right">주문자 :</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle1" align="right">물품 출발 주소 :</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle1" align="right">상세 주소 입력 :</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle1" align="right">휴대전화 :</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle1" align="right">이메일 :</Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* 오른쪽 70% 입력 영역 */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={2} direction="column">
              <Grid item>
                <TextField fullWidth defaultValue="홍길동" />
              </Grid>
              <Grid item>
                <Grid container spacing={2}>
                  <Grid item xs={9}>
                    <TextField fullWidth label="물품 출발 주소" />
                  </Grid>
                  <Grid item xs={3}>
                    <Button variant="outlined" fullWidth>
                      주소 찾기
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <TextField fullWidth label="상세 주소 입력" />
              </Grid>
              <Grid item>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField fullWidth label="010" />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField fullWidth label="1234" />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField fullWidth label="5678" />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField fullWidth defaultValue="abcd1234" />
                  </Grid>
                  <Grid item xs={1}>
                    <Typography align="center" mt={2}>@</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField fullWidth defaultValue="naver.com" />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth>
                      <Select defaultValue="직접입력">
                        <MenuItem value="직접입력">직접입력</MenuItem>
                        <MenuItem value="gmail.com">gmail.com</MenuItem>
                        <MenuItem value="daum.net">daum.net</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

            {/* 도착지 정보 */}
            <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" mb={2}>도착지 정보 입력</Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="받으시는 분" defaultValue="홍길동" disabled />
                    </Grid>

                    <Grid item xs={9} md={6}>
                        <TextField fullWidth label="물품 도착 주소" />
                    </Grid>
                    <Grid item xs={3}>
                        <Button variant="outlined" fullWidth sx={{ height: '100%' }}>
                            주소 찾기
                        </Button>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField fullWidth label="상세 주소 입력" />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="휴대전화" defaultValue="010-1234-5678" />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Grid container spacing={1}>
                            <Grid item xs={5}>
                                <TextField fullWidth defaultValue="abcd1234" />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography mt={2}>@</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField fullWidth defaultValue="naver.com" />
                            </Grid>
                            <Grid item xs={2}>
                                <FormControl fullWidth>
                                    <Select defaultValue="직접입력">
                                        <MenuItem value="직접입력">직접입력</MenuItem>
                                        <MenuItem value="gmail.com">gmail.com</MenuItem>
                                        <MenuItem value="daum.net">daum.net</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            {/* 결제 정보 */}
            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Typography variant="h6" mb={2}>결제 방법</Typography>
                    <Grid container spacing={2}>
                        <Grid item>
                            <Button variant="outlined">신용·체크카드</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="outlined">toss pay</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="outlined">kakao pay</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="outlined">N pay</Button>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} mt={2}>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>카드사 선택</InputLabel>
                                <Select>
                                    <MenuItem value="">삼성카드</MenuItem>
                                    <MenuItem value="">신한카드</MenuItem>
                                    <MenuItem value="">국민카드</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>일시불/할부</InputLabel>
                                <Select>
                                    <MenuItem value="">일시불</MenuItem>
                                    <MenuItem value="">3개월</MenuItem>
                                    <MenuItem value="">6개월</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="h6">총 결제금액</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography>기본 운송 요금: 250,000원</Typography>
                        <Typography>거리별 요금: 104,000원</Typography>
                        <Typography>추가 요금: 300,000원</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h5">654,000원</Typography>
                        <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                            결제하기
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
export default OrderComponent;