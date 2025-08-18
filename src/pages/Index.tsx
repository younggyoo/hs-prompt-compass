import { useState, useEffect } from "react";
import PromptCard from "@/components/PromptCard";
import PromptRegistration from "@/components/PromptRegistration";
import PromptDialog from "@/components/PromptDialog";
import VisitorCounter from "@/components/VisitorCounter";
import AdminMode from "@/components/AdminMode";
import PasswordDialog from "@/components/PasswordDialog";
import LoginDialog from "@/components/LoginDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { usePrompts, type Prompt, type Comment } from "@/hooks/usePrompts";
import { User, Heart, FileText, LogOut } from "lucide-react";

const Index = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("전체");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("likes");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editPrompt, setEditPrompt] = useState<Prompt | null>(null);
  const [likedPrompts, setLikedPrompts] = useState<string[]>(() => {
    const saved = localStorage.getItem('hs-liked-prompts');
    return saved ? JSON.parse(saved) : [];
  });
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
  
  // 새로 추가된 상태들
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('hs-current-user');
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState<'all' | 'my' | 'liked'>('all');
  
  const { toast } = useToast();

  // Supabase hooks 사용
  const {
    prompts,
    loading,
    addPrompt,
    updatePrompt: updatePromptDb,
    deletePrompt: deletePromptDb,
    incrementViews,
    incrementCopyCount,
    toggleLike,
    addComment: addCommentDb,
    updateComment: updateCommentDb,
    deleteComment: deleteCommentDb,
  } = usePrompts();

  useEffect(() => {
    localStorage.setItem('hs-liked-prompts', JSON.stringify(likedPrompts));
  }, [likedPrompts]);

  // 사용자 로그인 처리
  const handleLogin = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem('hs-current-user', username);
  };

  // 사용자 로그아웃 처리
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hs-current-user');
    setViewFilter('all');
    toast({
      title: "로그아웃되었습니다.",
    });
  };

  const handleCopy = async (content: string, title: string) => {
    navigator.clipboard.writeText(content);
    
    // 복사수 증가 (DB에 반영)
    const prompt = prompts.find(p => p.title === title);
    if (prompt) {
      await incrementCopyCount(prompt.id);
    }
    
    toast({
      title: `${title} 내용이 복사되었습니다.`,
    });
  };

  const handleLike = async (promptId: string) => {
    const isCurrentlyLiked = likedPrompts.includes(promptId);
    
    // 로컬 좋아요 상태 업데이트
    if (isCurrentlyLiked) {
      setLikedPrompts(prev => prev.filter(id => id !== promptId));
    } else {
      setLikedPrompts(prev => [...prev, promptId]);
    }

    // DB에 좋아요 상태 반영
    await toggleLike(promptId, !isCurrentlyLiked);

    // 다이얼로그가 열려있다면 업데이트
    if (selectedPrompt && selectedPrompt.id === promptId) {
      const newLikes = isCurrentlyLiked ? Math.max(0, selectedPrompt.likes - 1) : selectedPrompt.likes + 1;
      setSelectedPrompt(prev => prev ? { ...prev, likes: newLikes } : null);
    }
  };

  // 프롬프트 등록 시 Supabase 사용
  const addPromptWithUser = async (newPromptData: Omit<Prompt, 'id' | 'createdAt' | 'likes' | 'views' | 'comments' | 'copyCount'>) => {
    try {
      await addPrompt({
        ...newPromptData,
        author: currentUser || "익명", // 로그인하지 않은 경우 "익명"으로 처리
      });
    } catch (error) {
      console.error('Error adding prompt:', error);
    }
  };

  const updatePromptHandler = async (updatedPromptData: Omit<Prompt, 'id' | 'createdAt' | 'likes' | 'views' | 'comments' | 'copyCount'>) => {
    if (!editPrompt) return;
    
    try {
      await updatePromptDb(editPrompt.id, updatedPromptData);
      setEditPrompt(null);
    } catch (error) {
      console.error('Error updating prompt:', error);
    }
  };

  const handleViewContent = async (prompt: Prompt) => {
    // 조회수 증가 (DB에 반영)
    await incrementViews(prompt.id);
    
    setSelectedPrompt({ ...prompt, views: prompt.views + 1 });
    setIsDialogOpen(true);
  };

  const handleAddComment = async (promptId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    try {
      const newComment = await addCommentDb(promptId, comment);

      // 다이얼로그가 열려있다면 업데이트
      if (selectedPrompt && selectedPrompt.id === promptId) {
        setSelectedPrompt(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (promptId: string, commentId: string, content: string) => {
    try {
      await updateCommentDb(commentId, content);

      if (selectedPrompt && selectedPrompt.id === promptId) {
        setSelectedPrompt(prev => prev ? {
          ...prev,
          comments: prev.comments.map(comment =>
            comment.id === commentId ? { ...comment, content } : comment
          )
        } : null);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (promptId: string, commentId: string) => {
    try {
      await deleteCommentDb(commentId);

      if (selectedPrompt && selectedPrompt.id === promptId) {
        setSelectedPrompt(prev => prev ? {
          ...prev,
          comments: prev.comments.filter(comment => comment.id !== commentId)
        } : null);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
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

  const handleDeletePrompt = async (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;

    if (isAdmin) {
      // 관리자는 바로 삭제 가능
      if (confirm('정말로 이 프롬프트를 삭제하시겠습니까?')) {
        try {
          await deletePromptDb(promptId);
        } catch (error) {
          console.error('Error deleting prompt:', error);
        }
      }
    } else {
      // 일반 사용자는 비밀번호 확인 필요
      setPasswordDialog({
        isOpen: true,
        title: '프롬프트 삭제',
        description: '프롬프트를 삭제하려면 비밀번호를 입력해주세요.',
        onConfirm: async (password) => {
          if (password === prompt.password) {
            try {
              await deletePromptDb(promptId);
              setPasswordDialog(prev => ({ ...prev, isOpen: false }));
            } catch (error) {
              console.error('Error deleting prompt:', error);
            }
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

  const roles = ["전체", "공통", "상품기획", "R&D", "품질", "구매", "SCM", "생산", "영업/마케팅"];

  const filteredAndSortedPrompts = prompts
    .filter(prompt => {
      const searchRegex = new RegExp(searchQuery, 'i');
      const matchesSearch = searchRegex.test(prompt.title) || searchRegex.test(prompt.description) || searchRegex.test(prompt.content);
      const matchesRole = selectedRole === "전체" || prompt.role === selectedRole;
      const matchesType = selectedType ? prompt.type === selectedType : true;
      const matchesTool = selectedTool ? prompt.tool?.includes(selectedTool) : true;
      
      // 새로운 필터 조건 추가
      let matchesViewFilter = true;
      if (viewFilter === 'my' && currentUser) {
        matchesViewFilter = prompt.author === currentUser;
      } else if (viewFilter === 'liked') {
        matchesViewFilter = likedPrompts.includes(prompt.id);
      }
      
      return matchesSearch && matchesRole && matchesType && matchesTool && matchesViewFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "likes":
          return b.likes - a.likes;
        case "views":
          return b.views - a.views;
        case "copyCount":
          return (b.copyCount || 0) - (a.copyCount || 0);
        case "createdAt":
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  // 로딩 상태 체크
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A50034] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">프롬프트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <header className="container mx-auto p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#A50034]" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentUser}님
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                로그인
              </Button>
            )}
          </div>
          <VisitorCounter />
        </div>
        
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
                  <SelectItem value="copyCount">📋 복사순</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={value => setSelectedType(value === "all" ? null : value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="🏷️ 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 타입</SelectItem>
                  <SelectItem value="문서 작성">문서 작성</SelectItem>
                  <SelectItem value="요약/정리">요약/정리</SelectItem>
                  <SelectItem value="번역">번역</SelectItem>
                  <SelectItem value="검토/리뷰">검토/리뷰</SelectItem>
                  <SelectItem value="자동화">자동화</SelectItem>
                  <SelectItem value="질문/응답">질문/응답</SelectItem>
                  <SelectItem value="양식화">양식화</SelectItem>
                  <SelectItem value="분류/분석">분류/분석</SelectItem>
                  <SelectItem value="아이디어">아이디어</SelectItem>
                  <SelectItem value="코드 생성/리뷰">코드 생성/리뷰</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={value => setSelectedTool(value === "all" ? null : value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="🛠️ Tool 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 Tool</SelectItem>
                  <SelectItem value="엘지니 AI">엘지니 AI</SelectItem>
                  <SelectItem value="Chat EXAONE">Chat EXAONE</SelectItem>
                  <SelectItem value="CHATDA">CHATDA</SelectItem>
                  <SelectItem value="METIS">METIS</SelectItem>
                  <SelectItem value="MS Copilot">MS Copilot</SelectItem>
                  <SelectItem value="외부 Tool (ChatGPT, Claude, Gemini 등)">외부 Tool</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => {
                  setEditPrompt(null);
                  setIsRegistrationOpen(true);
                }}
                className="bg-gradient-to-r from-[#A50034] via-[#B8003D] to-[#8B002B] hover:from-[#8B002B] hover:via-[#A50034] hover:to-[#730024] text-white shadow-xl hover:shadow-2xl"
              >
                ➕ 새 프롬프트 등록
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // 수동 복원 버튼
                  const allKeys = Object.keys(localStorage);
                  const promptKeys = allKeys.filter(key => 
                    key.includes('prompt') || key.includes('hs-')
                  );
                  
                  let restoredPrompts: any[] = [];
                  
                  promptKeys.forEach(key => {
                    try {
                      const data = localStorage.getItem(key);
                      if (data) {
                        const parsed = JSON.parse(data);
                        if (Array.isArray(parsed)) {
                          restoredPrompts = [...restoredPrompts, ...parsed];
                        }
                      }
                    } catch (error) {
                      console.error(`Error parsing ${key}:`, error);
                    }
                  });
                  
                  if (restoredPrompts.length > 0) {
                    const uniquePrompts = restoredPrompts
                      .filter((prompt, index, arr) => 
                        arr.findIndex(p => p.id === prompt.id) === index
                      )
                      .filter((p: any) => 
                        !['김기획', '이R&D', '박기획', '최생산', '김영업', '이공통', '박품질', '정공통', '한번역', '차R&D', '김프로젝트', '이구매', '박SCM', '정품질', '신안전', '강교육', '조환경', '윤법무', '장IT', '고HR'].includes(p.author) &&
                        parseInt(p.id) > 20
                      );
                    
                    if (uniquePrompts.length > 0) {
                      const formattedPrompts = uniquePrompts.map((p: any) => ({
                        ...p,
                        copyCount: p.copyCount || 0,
                        createdAt: new Date(p.createdAt),
                        comments: p.comments?.map((c: any) => ({
                          ...c,
                          createdAt: new Date(c.createdAt)
                        })) || []
                      }));
                      
                      // 복원 버튼은 현재 Supabase 기반으로 동작하므로 제거하거나 다른 방식으로 처리
                      toast({
                        title: `${formattedPrompts.length}개의 프롬프트를 복원했습니다!`,
                        description: "수동 복원이 완료되었습니다."
                      });
                    } else {
                      toast({
                        title: "복원할 프롬프트를 찾을 수 없습니다.",
                        variant: "destructive"
                      });
                    }
                  } else {
                    toast({
                      title: "localStorage에서 데이터를 찾을 수 없습니다.",
                      variant: "destructive"
                    });
                  }
                }}
                className="text-xs"
              >
                🔄 프롬프트 복원
              </Button>
              
              {currentUser && (
                <div className="flex gap-2">
                  <Button
                    variant={viewFilter === 'my' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewFilter(viewFilter === 'my' ? 'all' : 'my')}
                    className="flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    내가 올린 프롬프트
                  </Button>
                  
                  <Button
                    variant={viewFilter === 'liked' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewFilter(viewFilter === 'liked' ? 'all' : 'liked')}
                    className="flex items-center gap-1"
                  >
                    <Heart className="w-4 h-4" />
                    좋아요한 프롬프트
                  </Button>
                </div>
              )}
            </div>
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
                  className={`
                    border-2 rounded-full px-3 py-1 h-auto font-medium transition-all duration-200 text-base
                    ${selectedRole === role 
                      ? 'bg-gradient-to-r from-[#A50034] to-[#8B002B] text-white border-[#A50034] shadow-lg opacity-100 [&>*]:!text-white [text-shadow:1px_1px_2px_rgba(255,255,255,0.8)]' 
                      : 'bg-transparent text-black border-[#A50034] hover:bg-[#A50034]/10 dark:text-white'
                    }
                  `}
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
              currentUser={currentUser}
              likedPrompts={likedPrompts}
            />
          ))}
        </div>

        {filteredAndSortedPrompts.length === 0 && (
          <div className="text-center mt-8">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              😔 {viewFilter === 'my' ? '등록한 프롬프트가' : viewFilter === 'liked' ? '좋아요한 프롬프트가' : '검색 결과가'} 없습니다.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {viewFilter === 'my' ? '새 프롬프트를 등록해보세요.' : viewFilter === 'liked' ? '마음에 드는 프롬프트에 좋아요를 눌러보세요.' : '다른 검색어를 사용하거나 필터를 조정해보세요.'}
            </p>
          </div>
        )}
      </main>

      {/* 관리자 모드 버튼을 하단에 배치 */}
      <div className="fixed bottom-4 left-4">
        <AdminMode isAdmin={isAdmin} onAdminToggle={setIsAdmin} prompts={prompts} />
      </div>

      <PromptRegistration
        isOpen={isRegistrationOpen}
        onClose={() => {
          setIsRegistrationOpen(false);
          setEditPrompt(null);
        }}
        onSubmit={editPrompt ? updatePromptHandler : addPromptWithUser}
        editPrompt={editPrompt}
      />

      <PromptDialog
        prompt={selectedPrompt}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCopy={handleCopy}
        onLike={handleLike}
        onAddComment={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        onEdit={handleEditPrompt}
        onDelete={handleDeletePrompt}
        isAdmin={isAdmin}
        currentUser={currentUser}
        likedPrompts={likedPrompts}
      />

      <PasswordDialog
        isOpen={passwordDialog.isOpen}
        onClose={() => setPasswordDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={passwordDialog.onConfirm}
        title={passwordDialog.title}
        description={passwordDialog.description}
      />

      <LoginDialog
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Index;
