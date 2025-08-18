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
import { usePrompts, type Prompt, type Comment } from "@/hooks/usePrompts";
import { Heart, FileText } from "lucide-react";

const Index = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("전체");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("좋아요순");
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
    isLiked,
    addComment: addCommentDb,
    updateComment: updateCommentDb,
    deleteComment: deleteCommentDb,
  } = usePrompts();

  useEffect(() => {
    localStorage.setItem('hs-liked-prompts', JSON.stringify(likedPrompts));
  }, [likedPrompts]);

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
    const currentlyLiked = isLiked(promptId);
    await toggleLike(promptId, currentlyLiked);

    // 다이얼로그가 열려있다면 업데이트  
    if (selectedPrompt && selectedPrompt.id === promptId) {
      const increment = currentlyLiked ? -1 : 1;
      setSelectedPrompt(prev => prev ? { ...prev, likes: prev.likes + increment } : null);
    }
  };

  // 프롬프트 등록 시 Supabase 사용
  const addPromptWithUser = async (promptData: {
    title: string;
    role: string;
    type: string;
    description: string;
    content: string;
    result?: string;
    tool?: string;
    author: string;
    password: string;
  }) => {
    try {
      // 입력받은 promptData를 그대로 전달 (author 포함)
      await addPrompt(promptData);
    } catch (error) {
      console.error('Error adding prompt:', error);
    }
  };

  const updatePromptHandler = async (promptData: {
    title: string;
    role: string;
    type: string;
    description: string;
    content: string;
    result?: string;
    tool?: string;
    author: string;
    password: string;
  }) => {
    if (!editPrompt) return;
    
    try {
      await updatePromptDb(editPrompt.id, {
        title: promptData.title,
        role: promptData.role,
        type: promptData.type,
        description: promptData.description,
        content: promptData.content,
        result: promptData.result,
        tool: promptData.tool,
        author: promptData.author
      }, promptData.password);
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
        onConfirm: async (password) => {
          try {
            // Edge function을 통해 비밀번호 검증
            await updatePromptDb(prompt.id, {
              title: prompt.title,
              role: prompt.role,
              type: prompt.type,
              description: prompt.description,
              content: prompt.content,
              result: prompt.result,
              tool: prompt.tool,
              author: prompt.author
            }, password);
            
            setEditPrompt(prompt);
            setIsRegistrationOpen(true);
            setPasswordDialog(prev => ({ ...prev, isOpen: false }));
          } catch (error) {
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
          try {
            await deletePromptDb(promptId, password);
            setPasswordDialog(prev => ({ ...prev, isOpen: false }));
          } catch (error) {
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
      
      return matchesSearch && matchesRole && matchesType && matchesTool;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "좋아요순":
          return b.likes - a.likes;
        case "생성일순":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "조회수순":
          return b.views - a.views;
        case "복사순":
          return (b.copyCount || 0) - (a.copyCount || 0);
        default:
          return b.likes - a.likes;
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

              <Select onValueChange={setSortBy} defaultValue="좋아요순">
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="📈 정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="좋아요순">👍 좋아요순</SelectItem>
                  <SelectItem value="생성일순">🕐 생성일순</SelectItem>
                  <SelectItem value="조회수순">👁️ 조회수순</SelectItem>
                  <SelectItem value="복사순">📋 복사순</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={value => setSelectedType(value === "모든 타입" ? null : value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="🏷️ 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="모든 타입">모든 타입</SelectItem>
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

              <Select onValueChange={value => setSelectedTool(value === "모든 Tool" ? null : value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="🛠️ Tool 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="모든 Tool">모든 Tool</SelectItem>
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
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 mb-8">
          <ToggleGroup 
            type="single" 
            value={selectedRole} 
            onValueChange={(value) => setSelectedRole(value || "전체")}
            className="justify-start flex-wrap gap-4"
          >
            {roles.map((role) => (
              <ToggleGroupItem
                key={role}
                value={role}
                aria-label={`${role} 선택`}
                className={`
                  border-2 rounded-full px-4 py-2 h-auto font-medium transition-all duration-200 text-base
                  ${selectedRole === role 
                    ? 'bg-gradient-to-r from-[#A50034] to-[#8B002B] text-white border-[#A50034] shadow-lg opacity-100 [&>*]:!text-white [text-shadow:1px_1px_2px_rgba(255,255,255,0.8)]' 
                    : 'bg-transparent text-black border-[#A50034] hover:bg-[#A50034]/10 dark:text-white'
                  }
                `}
              >
                {role === "R&D" ? "🧪 R&D" : 
                 role === "품질" ? "🔍 품질" :
                 role === "구매" ? "🛒 구매" :
                 role === "SCM" ? "🚛 SCM" :
                 role === "생산" ? "🏭 생산" :
                 role === "영업/마케팅" ? "📈 영업/마케팅" :
                 role === "상품기획" ? "💡 상품기획" :
                 role === "공통" ? "👥 공통" :
                 `🏢 ${role}`}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
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
                      likedPrompts={isLiked(prompt.id) ? [prompt.id] : []}
            />
          ))}
        </div>

        {filteredAndSortedPrompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              😔 검색 결과가 없습니다.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              다른 검색어를 사용하거나 필터를 조정해보세요.
            </p>
          </div>
        )}
      </main>

      {/* 관리자 인증 컴포넌트를 하단에 배치 */}
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
        likedPrompts={[]} // Will use isLiked function instead
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