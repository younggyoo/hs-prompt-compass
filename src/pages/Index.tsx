import { useState, useEffect } from "react";
import PromptCard from "@/components/PromptCard";
import PromptRegistration from "@/components/PromptRegistration";
import PromptDialog from "@/components/PromptDialog";
import VisitorCounter from "@/components/VisitorCounter";
import AdminMode from "@/components/AdminMode";
import PasswordDialog from "@/components/PasswordDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

interface Prompt {
  id: string;
  title: string;
  role: string;
  type: string;
  description: string;
  content: string;
  result?: string;
  tool?: string;
  author: string;
  password?: string;
  likes: number;
  views: number;
  comments: Comment[];
  createdAt: Date;
}

const Index = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("전체");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("likes");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editPrompt, setEditPrompt] = useState<Prompt | null>(null);
  const [passwordDialog, setPasswordDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: (password: string) => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });
  const { toast } = useToast();

  // 로컬 스토리지에서 프롬프트 불러오기
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const savedPrompts = localStorage.getItem('hs-prompts');
    if (savedPrompts) {
      try {
        const parsed = JSON.parse(savedPrompts);
        return parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          comments: p.comments?.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt)
          })) || []
        }));
      } catch (error) {
        console.error('Failed to parse saved prompts:', error);
      }
    }
    
    // 기본 프롬프트들
    return [
      {
        id: "1",
        title: "📝 회의록 요약 프롬프트",
        role: "기획",
        type: "요약",
        description: "긴 회의록을 핵심 내용 중심으로 간결하게 요약해주는 프롬프트",
        content: `다음 회의록을 읽고 핵심 내용을 3개 섹션으로 요약해주세요:

1. 주요 결정사항
2. 액션 아이템 (담당자별)
3. 다음 회의 안건

회의록:
[여기에 회의록 붙여넣기]`,
        result: `주요 결정사항:
- 신제품 출시일을 3월 15일로 확정
- 마케팅 예산 20% 증액 승인

액션 아이템:
- 김과장: 제품 사양서 최종 검토 (2/28까지)  
- 이대리: 마케팅 캠페인 기획안 작성 (3/5까지)

다음 회의 안건:
- 제품 런칭 이벤트 계획 검토
- Q1 매출 목표 재설정`,
        author: "김기획",
        password: "default123",
        likes: 12,
        views: 45,
        comments: [],
        createdAt: new Date('2024-01-15'),
      },
      {
        id: "2", 
        title: "📊 보고서 작성 프롬프트",
        role: "R&D",
        type: "작성",
        description: "데이터를 바탕으로 체계적인 분석 보고서를 작성하는 프롬프트",
        content: `다음 구조로 분석 보고서를 작성해주세요:

## 개요
- 분석 목적
- 데이터 범위
- 주요 발견사항 요약

## 상세 분석
- 핵심 지표 분석
- 트렌드 분석
- 문제점 및 기회요인

## 결론 및 제언
- 핵심 인사이트
- 실행 가능한 제언사항

데이터: [여기에 분석할 데이터 붙여넣기]`,
        result: `## 개요
분석 목적: 고객 이탈률 감소 방안 도출
데이터 범위: 2023년 1-12월 고객 데이터
주요 발견사항: 신규 고객 이탈률 35% → 기존 고객 대비 3배 높음

## 상세 분석  
핵심 지표: 첫 구매 후 30일 이내 이탈률이 가장 높음
트렌드: 모바일 앱 사용자의 이탈률이 웹 사용자보다 낮음
기회요인: 개인화 추천 서비스 이용 고객의 재구매율 60% 향상

## 결론 및 제언
핵심 인사이트: 초기 고객 경험이 이탈률에 결정적 영향
제언사항: 신규 고객 온보딩 프로그램 및 개인화 서비스 확대`,
        author: "이R&D",
        password: "default123",
        likes: 8,
        views: 32,
        comments: [],
        createdAt: new Date('2024-01-20'),
      },
    ];
  });

  // 프롬프트가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('hs-prompts', JSON.stringify(prompts));
  }, [prompts]);

  const handleCopy = (content: string, title: string) => {
    // HTML 태그 제거하고 텍스트만 추출
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    navigator.clipboard.writeText(textContent);
    toast({
      title: `${title} 내용이 복사되었습니다.`,
    });
  };

  const handleLike = (promptId: string) => {
    setPrompts(prevPrompts => 
      prevPrompts.map(prompt =>
        prompt.id === promptId 
          ? { ...prompt, likes: prompt.likes + 1 }
          : prompt
      )
    );

    // 다이얼로그가 열려있고 현재 프롬프트가 좋아요 된 프롬프트라면 업데이트
    if (selectedPrompt && selectedPrompt.id === promptId) {
      setSelectedPrompt(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    }
  };

  const addPrompt = (newPromptData: Omit<Prompt, 'id' | 'createdAt' | 'likes' | 'views' | 'comments'>) => {
    const newPrompt: Prompt = {
      ...newPromptData,
      id: Date.now().toString(),
      likes: 0,
      views: 0,
      comments: [],
      createdAt: new Date(),
    };
    setPrompts(prev => [newPrompt, ...prev]);
  };

  const updatePrompt = (updatedPromptData: Omit<Prompt, 'id' | 'createdAt' | 'likes' | 'views' | 'comments'>) => {
    if (!editPrompt) return;
    
    setPrompts(prevPrompts => 
      prevPrompts.map(prompt =>
        prompt.id === editPrompt.id 
          ? { ...prompt, ...updatedPromptData }
          : prompt
      )
    );
    setEditPrompt(null);
  };

  const handleViewContent = (prompt: Prompt) => {
    // 조회수 증가
    setPrompts(prevPrompts => 
      prevPrompts.map(p =>
        p.id === prompt.id 
          ? { ...p, views: p.views + 1 }
          : p
      )
    );
    
    setSelectedPrompt({ ...prompt, views: prompt.views + 1 });
    setIsDialogOpen(true);
  };

  const handleAddComment = (promptId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setPrompts(prevPrompts => 
      prevPrompts.map(prompt =>
        prompt.id === promptId 
          ? { ...prompt, comments: [...prompt.comments, newComment] }
          : prompt
      )
    );

    // 다이얼로그가 열려있다면 업데이트
    if (selectedPrompt && selectedPrompt.id === promptId) {
      setSelectedPrompt(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
    }
  };

  const handleEditPrompt = (prompt: Prompt) => {
    if (isAdmin) {
      // 관리자는 바로 수정 가능
      setEditPrompt(prompt);
      setIsRegistrationOpen(true);
    } else {
      // 일반 사용자는 비밀번호 확인 필요
      setPasswordDialog({
        isOpen: true,
        title: '프롬프트 수정',
        description: '프롬프트를 수정하려면 비밀번호를 입력해주세요.',
        onConfirm: (password) => {
          if (password === prompt.password) {
            setEditPrompt(prompt);
            setIsRegistrationOpen(true);
            setPasswordDialog(prev => ({ ...prev, isOpen: false }));
          } else {
            toast({
              title: "비밀번호가 틀렸습니다.",
              variant: "destructive",
            });
          }
        }
      });
    }
  };

  const handleDeletePrompt = (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;

    if (isAdmin) {
      // 관리자는 바로 삭제 가능
      if (confirm('정말로 이 프롬프트를 삭제하시겠습니까?')) {
        setPrompts(prev => prev.filter(p => p.id !== promptId));
        toast({
          title: "프롬프트가 삭제되었습니다.",
        });
      }
    } else {
      // 일반 사용자는 비밀번호 확인 필요
      setPasswordDialog({
        isOpen: true,
        title: '프롬프트 삭제',
        description: '프롬프트를 삭제하려면 비밀번호를 입력해주세요.',
        onConfirm: (password) => {
          if (password === prompt.password) {
            setPrompts(prev => prev.filter(p => p.id !== promptId));
            setPasswordDialog(prev => ({ ...prev, isOpen: false }));
            toast({
              title: "프롬프트가 삭제되었습니다.",
            });
          } else {
            toast({
              title: "비밀번호가 틀렸습니다.",
              variant: "destructive",
            });
          }
        }
      });
    }
  };

  const roles = ["전체", "R&D", "기획", "구매", "생산", "SCM", "품질", "영업/마케팅", "공통"];

  const filteredAndSortedPrompts = prompts
    .filter(prompt => {
      const searchRegex = new RegExp(searchQuery, 'i');
      const matchesSearch = searchRegex.test(prompt.title) || searchRegex.test(prompt.description) || searchRegex.test(prompt.content);
      const matchesRole = selectedRole === "전체" || prompt.role === selectedRole;
      const matchesType = selectedType ? prompt.type === selectedType : true;
      return matchesSearch && matchesRole && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "likes":
          return b.likes - a.likes;
        case "views":
          return b.views - a.views;
        case "createdAt":
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <header className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div></div>
          <AdminMode isAdmin={isAdmin} onAdminToggle={setIsAdmin} />
        </div>
        
        <VisitorCounter />
        
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mt-4">
          🏢 HS본부 프롬프트 라이브러리
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-2 max-w-2xl mx-auto">
          💡 업무에 바로 사용 가능한 프롬프트를 검색하고 복사하여 빠르고 쉽게 사용하세요,<br />
          ✨ 검증된 프롬프트를 찾아보고, 자신의 프롬프트도 공유해 보세요.
        </p>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
              <Input
                type="search"
                placeholder="🔍 프롬프트 검색..."
                className="w-full md:w-64 lg:w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select onValueChange={setSortBy} defaultValue="likes">
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="📈 정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="likes">👍 좋아요순</SelectItem>
                  <SelectItem value="createdAt">🕐 생성일순</SelectItem>
                  <SelectItem value="views">👁️ 조회수순</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={value => setSelectedType(value === "all" ? null : value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="🏷️ 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 타입</SelectItem>
                  <SelectItem value="요약">요약</SelectItem>
                  <SelectItem value="번역">번역</SelectItem>
                  <SelectItem value="작성">작성</SelectItem>
                  <SelectItem value="분석">분석</SelectItem>
                  <SelectItem value="아이디어">아이디어</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => {
                setEditPrompt(null);
                setIsRegistrationOpen(true);
              }}
              className="bg-gradient-to-r from-[#A50034] via-[#B8003D] to-[#8B002B] hover:from-[#8B002B] hover:via-[#A50034] hover:to-[#730024] text-white shadow-xl hover:shadow-2xl"
            >
              ➕ 새 프롬프트 등록
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            <ToggleGroup 
              type="single" 
              value={selectedRole} 
              onValueChange={(value) => setSelectedRole(value || "전체")}
              className="justify-start flex-wrap gap-2"
            >
              {roles.map((role) => (
                <ToggleGroupItem
                  key={role}
                  value={role}
                  aria-label={`${role} 선택`}
                  className="border border-gray-300 dark:border-gray-600 data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#A50034] data-[state=on]:to-[#8B002B] data-[state=on]:text-white data-[state=on]:border-[#A50034] hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  {role}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredAndSortedPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onCopy={handleCopy}
              onLike={handleLike}
              onViewContent={handleViewContent}
              onEdit={handleEditPrompt}
              onDelete={handleDeletePrompt}
              isAdmin={isAdmin}
            />
          ))}
        </div>

        {filteredAndSortedPrompts.length === 0 && (
          <div className="text-center mt-8">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              😔 검색 결과가 없습니다.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              다른 검색어를 사용하거나 필터를 조정해보세요.
            </p>
          </div>
        )}
      </main>

      <PromptRegistration
        isOpen={isRegistrationOpen}
        onClose={() => {
          setIsRegistrationOpen(false);
          setEditPrompt(null);
        }}
        onSubmit={editPrompt ? updatePrompt : addPrompt}
        editPrompt={editPrompt}
      />

      <PromptDialog
        prompt={selectedPrompt}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCopy={handleCopy}
        onLike={handleLike}
        onAddComment={handleAddComment}
        onEdit={handleEditPrompt}
        onDelete={handleDeletePrompt}
        isAdmin={isAdmin}
      />

      <PasswordDialog
        isOpen={passwordDialog.isOpen}
        onClose={() => setPasswordDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={passwordDialog.onConfirm}
        title={passwordDialog.title}
        description={passwordDialog.description}
      />
    </div>
  );
};

export default Index;
