import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { MessageCircle, Search, User, Calendar, ChevronRight, Lock, Eye } from "lucide-react";

interface QAItem {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  date: string;
  status: "answered" | "pending" | "resolved";
  views: number;
  isPrivate?: boolean;
  adminResponse?: {
    content: string;
    author: string;
    date: string;
  };
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const QABoard = () => {
  const [activeMainTab, setActiveMainTab] = useState("contact");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFaqCategory, setActiveFaqCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewInquiryOpen, setIsNewInquiryOpen] = useState(false);
  const [newInquiry, setNewInquiry] = useState({
    title: "",
    content: "",
    category: "",
    isPrivate: false
  });
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [expandedFaqs, setExpandedFaqs] = useState<Set<number>>(new Set());
  const [currentFaqPage, setCurrentFaqPage] = useState(1);

  const ITEMS_PER_PAGE = 4;
  const FAQ_ITEMS_PER_PAGE = 5;

  const categories = [
    { id: "all", name: "전체" },
    { id: "general", name: "일반문의" },
    { id: "technical", name: "기술지원" },
    { id: "billing", name: "결제/요금" },
    { id: "service", name: "서비스이용" },
    { id: "etc", name: "기타" }
  ];

  const qaItems: QAItem[] = [
    {
      id: 1,
      title: "서비스 이용 중 로그인 문제가 발생합니다",
      content: "로그인을 시도하면 오류 메시지가 표시됩니다. 해결 방법을 알려주세요.",
      author: "김철수",
      category: "technical",
      date: "2024-01-15",
      status: "answered",
      views: 156,
      adminResponse: {
        content: "안녕하세요. 로그인 문제는 브라우저 쿠키 설정과 관련이 있을 수 있습니다. 브라우저의 쿠키와 캐시를 삭제하신 후 다시 시도해보시기 바랍니다. 문제가 지속되면 개발팀으로 연락 주세요.",
        author: "고객지원팀",
        date: "2024-01-15"
      }
    },
    {
      id: 2,
      title: "월 이용료 결제 방법을 변경하고 싶습니다",
      content: "신용카드에서 계좌이체로 결제 방법을 변경할 수 있나요?",
      author: "이영희",
      category: "billing",
      date: "2024-01-14",
      status: "resolved",
      views: 89,
      isPrivate: true,
      adminResponse: {
        content: "네, 결제 방법 변경이 가능합니다. 마이페이지 > 결제 설정에서 변경하실 수 있습니다. 추가 문의사항이 있으시면 언제든 연락주세요.",
        author: "결제지원팀",
        date: "2024-01-14"
      }
    },
    {
      id: 3,
      title: "새로운 기능 요청사항이 있습니다",
      content: "모바일 앱에서도 이용 가능한 기능을 추가해주세요.",
      author: "박민수",
      category: "service",
      date: "2024-01-13",
      status: "pending",
      views: 234
    },
    {
      id: 4,
      title: "개인정보 처리방침 관련 문의",
      content: "개인정보가 어떻게 처리되는지 자세히 알고 싶습니다.",
      author: "정지영",
      category: "general",
      date: "2024-01-12",
      status: "answered",
      views: 178,
      isPrivate: true,
      adminResponse: {
        content: "개인정보 처리방침은 홈페이지 하단에서 확인하실 수 있습니다. 추가적인 문의사항이 있으시면 privacy@company.com으로 연락주세요.",
        author: "개인정보보호팀",
        date: "2024-01-12"
      }
    },
    {
      id: 5,
      title: "API 연동 관련 기술 지원",
      content: "API 연동 시 발생하는 오류에 대한 지원이 필요합니다.",
      author: "최웹개발",
      category: "technical",
      date: "2024-01-11",
      status: "pending",
      views: 97
    },
    {
      id: 6,
      title: "서비스 해지 절차가 궁금합니다",
      content: "서비스를 해지하려면 어떤 절차를 따라야 하나요?",
      author: "홍길동",
      category: "service",
      date: "2024-01-10",
      status: "resolved",
      views: 143,
      adminResponse: {
        content: "서비스 해지는 마이페이지에서 직접 처리하실 수 있습니다. 해지 시 데이터는 30일간 보관되며, 이후 완전 삭제됩니다.",
        author: "고객지원팀",
        date: "2024-01-10"
      }
    },
    {
      id: 7,
      title: "요금제 변경 문의",
      content: "현재 이용 중인 요금제를 다른 요금제로 변경할 수 있나요?",
      author: "김비즈",
      category: "billing",
      date: "2024-01-09",
      status: "answered",
      views: 201,
      adminResponse: {
        content: "요금제 변경은 언제든 가능합니다. 단, 더 높은 등급으로 변경 시에는 즉시 적용되며, 낮은 등급으로 변경 시에는 다음 결제일부터 적용됩니다.",
        author: "결제지원팀",
        date: "2024-01-09"
      }
    }
  ];

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: "서비스 이용 시간은 어떻게 되나요?",
      answer: "24시간 연중무휴로 서비스를 이용하실 수 있습니다.",
      category: "general"
    },
    {
      id: 2,
      question: "회원가입은 무료인가요?",
      answer: "네, 회원가입은 무료이며 기본 서비스도 무료로 이용 가능합니다.",
      category: "service"
    },
    {
      id: 3,
      question: "비밀번호를 잊어버렸어요",
      answer: "로그인 페이지에서 '비밀번호 찾기'를 클릭하여 재설정하실 수 있습니다.",
      category: "technical"
    },
    {
      id: 4,
      question: "결제 방법을 변경할 수 있나요?",
      answer: "마이페이지에서 결제 정보를 수정하실 수 있습니다. 신용카드, 계좌이체 등 다양한 방법을 지원합니다.",
      category: "billing"
    },
    {
      id: 5,
      question: "환불 정책은 어떻게 되나요?",
      answer: "서비스 이용 약관에 따라 결제일로부터 7일 이내 부분 환불이 가능합니다.",
      category: "billing"
    },
    {
      id: 6,
      question: "API 사용 제한이 있나요?",
      answer: "요금제에 따라 API 호출 제한이 다릅니다. 자세한 내용은 요금제 페이지를 확인해주세요.",
      category: "technical"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "answered": return "답변완료";
      case "pending": return "답변대기";
      case "resolved": return "해결완료";
      default: return "미분류";
    }
  };

  const filteredItems = qaItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredFaqItems = faqItems.filter(faq => {
    return activeFaqCategory === "all" || faq.category === activeFaqCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // FAQ Pagination logic
  const totalFaqPages = Math.ceil(filteredFaqItems.length / FAQ_ITEMS_PER_PAGE);
  const startFaqIndex = (currentFaqPage - 1) * FAQ_ITEMS_PER_PAGE;
  const paginatedFaqItems = filteredFaqItems.slice(startFaqIndex, startFaqIndex + FAQ_ITEMS_PER_PAGE);

  const togglePostExpansion = (postId: number) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const toggleFaqExpansion = (faqId: number) => {
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
    // Here you would normally submit to your backend
    console.log("New inquiry:", newInquiry);
    setIsNewInquiryOpen(false);
    setNewInquiry({ title: "", content: "", category: "", isPrivate: false });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Main Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-foreground">고객지원</h1>
        <p className="text-muted-foreground">궁금한 사항이 있으시면 언제든 문의해주세요</p>
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveMainTab("contact")}
          className={`flex-1 py-3 px-6 rounded-md font-medium transition-all ${
            activeMainTab === "contact"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-tab-hover hover:text-foreground"
          }`}
        >
          <MessageCircle className="w-4 h-4 inline mr-2" />
          문의하기
        </button>
        <button
          onClick={() => setActiveMainTab("faq")}
          className={`flex-1 py-3 px-6 rounded-md font-medium transition-all ${
            activeMainTab === "faq"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-tab-hover hover:text-foreground"
          }`}
        >
          FAQ
        </button>
      </div>

      {activeMainTab === "contact" && (
        <div className="space-y-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-border">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`py-2 px-4 border-b-2 font-medium transition-colors ${
                  activeCategory === category.id
                    ? "border-tab-active text-tab-active"
                    : "border-transparent text-tab-inactive hover:text-tab-active hover:border-tab-hover"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Search Bar and New Inquiry Button */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="궁금한 내용을 검색해보세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isNewInquiryOpen} onOpenChange={setIsNewInquiryOpen}>
              <DialogTrigger asChild>
                <Button>
                  새 문의 작성하기
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>새 문의 작성</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">제목</label>
                    <Input
                      value={newInquiry.title}
                      onChange={(e) => setNewInquiry({ ...newInquiry, title: e.target.value })}
                      placeholder="문의 제목을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">카테고리</label>
                    <Select value={newInquiry.category} onValueChange={(value) => setNewInquiry({ ...newInquiry, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.id !== "all").map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">내용</label>
                    <Textarea
                      value={newInquiry.content}
                      onChange={(e) => setNewInquiry({ ...newInquiry, content: e.target.value })}
                      placeholder="문의 내용을 자세히 작성해주세요"
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="private"
                      type="checkbox"
                      checked={newInquiry.isPrivate}
                      onChange={(e) => setNewInquiry({ ...newInquiry, isPrivate: e.target.checked })}
                      className="rounded border-border"
                    />
                    <label htmlFor="private" className="text-sm">비공개 문의</label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsNewInquiryOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleSubmitInquiry}>
                      문의 등록
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

           {/* Q&A List */}
          <div className="space-y-4">
            {paginatedItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => togglePostExpansion(item.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                       <div className="flex items-center gap-2 mb-2">
                         <Badge className={getStatusColor(item.status)}>
                           {getStatusText(item.status)}
                         </Badge>
                         {item.isPrivate && (
                           <Badge variant="outline" className="text-muted-foreground border-muted-foreground">
                             <Lock className="w-3 h-3 mr-1" />
                             비공개
                           </Badge>
                         )}
                         <span className="text-sm text-muted-foreground">
                           {categories.find(c => c.id === item.category)?.name}
                         </span>
                       </div>
                       <CardTitle className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
                         {item.isPrivate ? "비공개 문의 입니다" : item.title}
                       </CardTitle>
                       {!item.isPrivate && (
                         <p className={`text-muted-foreground text-sm ${expandedPosts.has(item.id) ? '' : 'line-clamp-2'}`}>
                           {item.content}
                         </p>
                       )}
                    </div>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground ml-4 transition-transform ${expandedPosts.has(item.id) ? 'rotate-90' : ''}`} />
                  </div>
                </CardHeader>
                {expandedPosts.has(item.id) && !item.isPrivate && item.adminResponse && (
                  <CardContent className="pt-0 border-t border-border mt-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                       <div className="flex items-start gap-3">
                         <div className="flex-1">
                           <div className="flex items-center gap-2 mb-2">
                             <span className="font-medium text-primary">{item.adminResponse.author}</span>
                             <span className="text-xs text-muted-foreground">{item.adminResponse.date}</span>
                           </div>
                           <p className="text-sm leading-relaxed">{item.adminResponse.content}</p>
                         </div>
                       </div>
                    </div>
                  </CardContent>
                )}
                <CardContent className="pt-0">
                  {!item.isPrivate && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.date}
                        </div>
                      </div>
                      <span>조회 {item.views}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        href="#"
                      />
                    </PaginationItem>
                  )}
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        href="#"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}

        </div>
      )}

      {activeMainTab === "faq" && (
        <div className="space-y-6">
          {/* FAQ Category Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-border">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFaqCategory(category.id)}
                className={`py-2 px-4 border-b-2 font-medium transition-colors ${
                  activeFaqCategory === category.id
                    ? "border-tab-active text-tab-active"
                    : "border-transparent text-tab-inactive hover:text-tab-active hover:border-tab-hover"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* FAQ List */}
          <div className="space-y-4">
            {paginatedFaqItems.map((faq) => (
              <Card key={faq.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => toggleFaqExpansion(faq.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 hover:text-primary transition-colors">
                      <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        Q
                      </span>
                      {faq.question}
                    </CardTitle>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground ml-4 transition-transform ${expandedFaqs.has(faq.id) ? 'rotate-90' : ''}`} />
                  </div>
                </CardHeader>
                {expandedFaqs.has(faq.id) && (
                  <CardContent className="pt-0">
                    <div className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        A
                      </span>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {filteredFaqItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          )}

          {/* FAQ Pagination */}
          {totalFaqPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  {currentFaqPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentFaqPage(currentFaqPage - 1)}
                        href="#"
                      />
                    </PaginationItem>
                  )}
                  
                  {Array.from({ length: totalFaqPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={currentFaqPage === page}
                        onClick={() => setCurrentFaqPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  {currentFaqPage < totalFaqPages && (
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentFaqPage(currentFaqPage + 1)}
                        href="#"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QABoard;