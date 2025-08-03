import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tab,
  Tabs,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
  InputAdornment,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import {
  Search,
  Person,
  CalendarToday,
  ExpandMore,
  Lock,
  Visibility,
  Forum
} from '@mui/icons-material';

const QABoardMUI = () => {
  const [activeMainTab, setActiveMainTab] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFaqCategory, setActiveFaqCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewInquiryOpen, setIsNewInquiryOpen] = useState(false);
  const [newInquiry, setNewInquiry] = useState({
    title: '',
    content: '',
    category: '',
    isPrivate: false
  });
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [expandedFaqs, setExpandedFaqs] = useState(new Set());
  const [currentFaqPage, setCurrentFaqPage] = useState(1);

  const ITEMS_PER_PAGE = 4;
  const FAQ_ITEMS_PER_PAGE = 5;

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'general', name: '일반문의' },
    { id: 'technical', name: '기술지원' },
    { id: 'billing', name: '결제/요금' },
    { id: 'service', name: '서비스이용' },
    { id: 'etc', name: '기타' }
  ];

  const qaItems = [
    {
      id: 1,
      title: '서비스 이용 중 로그인 문제가 발생합니다',
      content: '로그인을 시도하면 오류 메시지가 표시됩니다. 해결 방법을 알려주세요.',
      author: '김철수',
      category: 'technical',
      date: '2024-01-15',
      status: 'answered',
      views: 156,
      adminResponse: {
        content: '안녕하세요. 로그인 문제는 브라우저 쿠키 설정과 관련이 있을 수 있습니다. 브라우저의 쿠키와 캐시를 삭제하신 후 다시 시도해보시기 바랍니다. 문제가 지속되면 개발팀으로 연락 주세요.',
        author: '고객지원팀',
        date: '2024-01-15'
      }
    },
    {
      id: 2,
      title: '월 이용료 결제 방법을 변경하고 싶습니다',
      content: '신용카드에서 계좌이체로 결제 방법을 변경할 수 있나요?',
      author: '이영희',
      category: 'billing',
      date: '2024-01-14',
      status: 'resolved',
      views: 89,
      isPrivate: true,
      adminResponse: {
        content: '네, 결제 방법 변경이 가능합니다. 마이페이지 > 결제 설정에서 변경하실 수 있습니다. 추가 문의사항이 있으시면 언제든 연락주세요.',
        author: '결제지원팀',
        date: '2024-01-14'
      }
    },
    {
      id: 3,
      title: '새로운 기능 요청사항이 있습니다',
      content: '모바일 앱에서도 이용 가능한 기능을 추가해주세요.',
      author: '박민수',
      category: 'service',
      date: '2024-01-13',
      status: 'pending',
      views: 234
    },
    {
      id: 4,
      title: '개인정보 처리방침 관련 문의',
      content: '개인정보가 어떻게 처리되는지 자세히 알고 싶습니다.',
      author: '정지영',
      category: 'general',
      date: '2024-01-12',
      status: 'answered',
      views: 178,
      isPrivate: true,
      adminResponse: {
        content: '개인정보 처리방침은 홈페이지 하단에서 확인하실 수 있습니다. 추가적인 문의사항이 있으시면 privacy@company.com으로 연락주세요.',
        author: '개인정보보호팀',
        date: '2024-01-12'
      }
    },
    {
      id: 5,
      title: 'API 연동 관련 기술 지원',
      content: 'API 연동 시 발생하는 오류에 대한 지원이 필요합니다.',
      author: '최웹개발',
      category: 'technical',
      date: '2024-01-11',
      status: 'pending',
      views: 97
    },
    {
      id: 6,
      title: '서비스 해지 절차가 궁금합니다',
      content: '서비스를 해지하려면 어떤 절차를 따라야 하나요?',
      author: '홍길동',
      category: 'service',
      date: '2024-01-10',
      status: 'resolved',
      views: 143,
      adminResponse: {
        content: '서비스 해지는 마이페이지에서 직접 처리하실 수 있습니다. 해지 시 데이터는 30일간 보관되며, 이후 완전 삭제됩니다.',
        author: '고객지원팀',
        date: '2024-01-10'
      }
    },
    {
      id: 7,
      title: '요금제 변경 문의',
      content: '현재 이용 중인 요금제를 다른 요금제로 변경할 수 있나요?',
      author: '김비즈',
      category: 'billing',
      date: '2024-01-09',
      status: 'answered',
      views: 201,
      adminResponse: {
        content: '요금제 변경은 언제든 가능합니다. 단, 더 높은 등급으로 변경 시에는 즉시 적용되며, 낮은 등급으로 변경 시에는 다음 결제일부터 적용됩니다.',
        author: '결제지원팀',
        date: '2024-01-09'
      }
    }
  ];

  const faqItems = [
    {
      id: 1,
      question: '서비스 이용 시간은 어떻게 되나요?',
      answer: '24시간 연중무휴로 서비스를 이용하실 수 있습니다.',
      category: 'general'
    },
    {
      id: 2,
      question: '회원가입은 무료인가요?',
      answer: '네, 회원가입은 무료이며 기본 서비스도 무료로 이용 가능합니다.',
      category: 'service'
    },
    {
      id: 3,
      question: '비밀번호를 잊어버렸어요',
      answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하여 재설정하실 수 있습니다.',
      category: 'technical'
    },
    {
      id: 4,
      question: '결제 방법을 변경할 수 있나요?',
      answer: '마이페이지에서 결제 정보를 수정하실 수 있습니다. 신용카드, 계좌이체 등 다양한 방법을 지원합니다.',
      category: 'billing'
    },
    {
      id: 5,
      question: '환불 정책은 어떻게 되나요?',
      answer: '서비스 이용 약관에 따라 결제일로부터 7일 이내 부분 환불이 가능합니다.',
      category: 'billing'
    },
    {
      id: 6,
      question: 'API 사용 제한이 있나요?',
      answer: '요금제에 따라 API 호출 제한이 다릅니다. 자세한 내용은 요금제 페이지를 확인해주세요.',
      category: 'technical'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered': return { backgroundColor: '#e8f5e8', color: '#2e7d32' };
      case 'pending': return { backgroundColor: '#fff3e0', color: '#f57c00' };
      case 'resolved': return { backgroundColor: '#e3f2fd', color: '#1976d2' };
      default: return { backgroundColor: '#f5f5f5', color: '#424242' };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'answered': return '답변완료';
      case 'pending': return '답변대기';
      case 'resolved': return '해결완료';
      default: return '미분류';
    }
  };

  const filteredItems = qaItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredFaqItems = faqItems.filter(faq => {
    return activeFaqCategory === 'all' || faq.category === activeFaqCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // FAQ Pagination logic
  const totalFaqPages = Math.ceil(filteredFaqItems.length / FAQ_ITEMS_PER_PAGE);
  const startFaqIndex = (currentFaqPage - 1) * FAQ_ITEMS_PER_PAGE;
  const paginatedFaqItems = filteredFaqItems.slice(startFaqIndex, startFaqIndex + FAQ_ITEMS_PER_PAGE);

  const togglePostExpansion = (postId) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const toggleFaqExpansion = (faqId) => {
    const newExpanded = new Set(expandedFaqs);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedFaqs(newExpanded);
  };

  // Initialize FAQ items to be expanded by default
  useEffect(() => {
    setExpandedFaqs(new Set(faqItems.map(faq => faq.id)));
  }, []);

  const handleSubmitInquiry = () => {
    console.log('New inquiry:', newInquiry);
    setIsNewInquiryOpen(false);
    setNewInquiry({ title: '', content: '', category: '', isPrivate: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveMainTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Main Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          고객지원
        </Typography>
        <Typography variant="h6" color="text.secondary">
          궁금한 사항이 있으시면 언제든 문의해주세요
        </Typography>
      </Box>

      {/* Main Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeMainTab} onChange={handleTabChange} centered>
          <Tab 
            icon={<Forum />} 
            label="문의하기" 
            iconPosition="start"
            sx={{ minHeight: 64, fontSize: '1.1rem' }}
          />
          <Tab 
            label="FAQ" 
            sx={{ minHeight: 64, fontSize: '1.1rem' }}
          />
        </Tabs>
      </Box>

      {activeMainTab === 0 && (
        <Box>
          {/* Category Tabs */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? 'contained' : 'outlined'}
                  onClick={() => setActiveCategory(category.id)}
                  sx={{ minWidth: 100, mb: 1 }}
                >
                  {category.name}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Search Bar and New Inquiry Button */}
          <Box display="flex" gap={2} mb={3} alignItems="center">
            <TextField
              fullWidth
              placeholder="궁금한 내용을 검색해보세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button 
              variant="contained" 
              onClick={() => setIsNewInquiryOpen(true)}
              sx={{ minWidth: 140, height: 56 }}
            >
              새 문의 작성하기
            </Button>
          </Box>

          {/* Q&A List */}
          <Box mb={3}>
            {paginatedItems.map((item) => (
              <Card 
                key={item.id} 
                sx={{ mb: 2, cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                onClick={() => togglePostExpansion(item.id)}
              >
                <CardHeader
                  title={
                    <Box>
                      <Box display="flex" gap={1} mb={1} alignItems="center">
                        <Chip
                          label={getStatusText(item.status)}
                          size="small"
                          sx={getStatusColor(item.status)}
                        />
                        {item.isPrivate && (
                          <Chip
                            icon={<Lock />}
                            label="비공개"
                            size="small"
                            variant="outlined"
                          />
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {categories.find(c => c.id === item.category)?.name}
                        </Typography>
                      </Box>
                      <Typography variant="h6" component="h3">
                        {item.isPrivate ? '비공개 문의 입니다' : item.title}
                      </Typography>
                    </Box>
                  }
                  action={
                    <IconButton>
                      <ExpandMore sx={{ 
                        transform: expandedPosts.has(item.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                      }} />
                    </IconButton>
                  }
                />
                
                {!item.isPrivate && (
                  <CardContent sx={{ pt: 0 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: expandedPosts.has(item.id) ? 'none' : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {item.content}
                    </Typography>
                  </CardContent>
                )}

                {expandedPosts.has(item.id) && !item.isPrivate && item.adminResponse && (
                  <>
                    <Divider />
                    <CardContent>
                      <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Typography variant="subtitle2" color="primary">
                            {item.adminResponse.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.adminResponse.date}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {item.adminResponse.content}
                        </Typography>
                      </Box>
                    </CardContent>
                  </>
                )}

                {!item.isPrivate && (
                  <CardContent sx={{ pt: 0 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" gap={2}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Person fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            {item.author}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <CalendarToday fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            {item.date}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        조회 {item.views}
                      </Typography>
                    </Box>
                  </CardContent>
                )}
              </Card>
            ))}
          </Box>

          {filteredItems.length === 0 && (
            <Box textAlign="center" py={6}>
              <Typography color="text.secondary">검색 결과가 없습니다.</Typography>
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, value) => setCurrentPage(value)}
                color="primary"
              />
            </Box>
          )}

          {/* New Inquiry Dialog */}
          <Dialog 
            open={isNewInquiryOpen} 
            onClose={() => setIsNewInquiryOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>새 문의 작성</DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  label="제목"
                  fullWidth
                  value={newInquiry.title}
                  onChange={(e) => setNewInquiry({ ...newInquiry, title: e.target.value })}
                />
                
                <FormControl fullWidth>
                  <InputLabel>카테고리</InputLabel>
                  <Select
                    value={newInquiry.category}
                    label="카테고리"
                    onChange={(e) => setNewInquiry({ ...newInquiry, category: e.target.value })}
                  >
                    {categories.filter(c => c.id !== 'all').map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="내용"
                  multiline
                  rows={4}
                  fullWidth
                  value={newInquiry.content}
                  onChange={(e) => setNewInquiry({ ...newInquiry, content: e.target.value })}
                  placeholder="문의 내용을 자세히 작성해주세요"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newInquiry.isPrivate}
                      onChange={(e) => setNewInquiry({ ...newInquiry, isPrivate: e.target.checked })}
                    />
                  }
                  label="비공개 문의"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsNewInquiryOpen(false)}>취소</Button>
              <Button onClick={handleSubmitInquiry} variant="contained">문의 등록</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {activeMainTab === 1 && (
        <Box>
          {/* FAQ Category Buttons */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeFaqCategory === category.id ? 'contained' : 'outlined'}
                  onClick={() => setActiveFaqCategory(category.id)}
                  sx={{ minWidth: 100, mb: 1 }}
                >
                  {category.name}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* FAQ List */}
          <Box mb={3}>
            {paginatedFaqItems.map((faq) => (
              <Accordion 
                key={faq.id}
                expanded={expandedFaqs.has(faq.id)}
                onChange={() => toggleFaqExpansion(faq.id)}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box 
                      sx={{ 
                        width: 24, height: 24, 
                        borderRadius: '50%', 
                        backgroundColor: 'primary.main', 
                        color: 'white',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Q
                    </Box>
                    <Typography variant="h6" component="h3">
                      {faq.question}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <Box 
                      sx={{ 
                        width: 24, height: 24, 
                        borderRadius: '50%', 
                        backgroundColor: 'secondary.main', 
                        color: 'white',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        mt: 0.5
                      }}
                    >
                      A
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          {filteredFaqItems.length === 0 && (
            <Box textAlign="center" py={6}>
              <Typography color="text.secondary">검색 결과가 없습니다.</Typography>
            </Box>
          )}

          {/* FAQ Pagination */}
          {totalFaqPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalFaqPages}
                page={currentFaqPage}
                onChange={(event, value) => setCurrentFaqPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default QABoardMUI;