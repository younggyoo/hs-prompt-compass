import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, LogIn, User, Heart } from "lucide-react";
import PromptCard from "@/components/PromptCard";
import PromptRegistration from "@/components/PromptRegistration";
import LoginDialog from "@/components/LoginDialog";
import PromptDialog from "@/components/PromptDialog";
import FilterDropdown from "@/components/FilterDropdown";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  author: string;
  content: string;
  password?: string;
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
  copyCount: number;
  comments: Comment[];
  createdAt: Date;
}

const Index = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("전체");
  const [selectedType, setSelectedType] = useState("전체");
  const [sortBy, setSortBy] = useState("최신순");
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [viewFilter, setViewFilter] = useState<string>('all');
  const [likedPrompts, setLikedPrompts] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedPrompts = localStorage.getItem("prompts");
    if (storedPrompts) {
      setPrompts(JSON.parse(storedPrompts));
    }

    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(storedUser);
    }

    const storedLikedPrompts = localStorage.getItem("likedPrompts");
    if (storedLikedPrompts) {
      setLikedPrompts(JSON.parse(storedLikedPrompts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('likedPrompts', JSON.stringify(likedPrompts));
  }, [likedPrompts]);

  const roleOptions = ["전체", "R&D", "기획", "구매", "생산", "SCM", "품질", "영업/마케팅", "공통"];
  const typeOptions = ["전체", "아이디어", "요약", "분석", "작성", "번역", "편집"];
  const sortOptions = ["최신순", "인기순", "조회순"];

  const filteredPrompts = prompts.filter((prompt) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchTermLower) ||
      prompt.description.toLowerCase().includes(searchTermLower) ||
      prompt.content.toLowerCase().includes(searchTermLower);

    const matchesRole = selectedRole === "전체" || prompt.role === selectedRole;
    const matchesType = selectedType === "전체" || prompt.type === selectedType;

    return matchesSearch && matchesRole && matchesType;
  }).filter(prompt => {
    if (viewFilter === 'myPrompts' && currentUser) {
      return prompt.author === currentUser;
    } else if (viewFilter === 'likedPrompts') {
      return likedPrompts.includes(prompt.id);
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "최신순") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "인기순") {
      return b.likes - a.likes;
    } else if (sortBy === "조회순") {
      return b.views - a.views;
    }
    return 0;
  });

  const handlePromptSubmit = (promptData: any) => {
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      ...promptData,
      likes: 0,
      views: 0,
      copyCount: 0,
      comments: [],
      createdAt: new Date(),
    };
    
    const updatedPrompts = [...prompts, newPrompt];
    setPrompts(updatedPrompts);
    localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
    setIsPromptDialogOpen(false);

    toast({
      title: "프롬프트가 성공적으로 등록되었습니다! 🎉",
      description: `"${promptData.title}"이(가) 추가되었습니다.`,
    });
  };

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem("currentUser", username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    setViewFilter('all');
    toast({
      title: "로그아웃 되었습니다.",
    });
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsPromptDialogOpen(true);
  };

  const handleDeletePrompt = (id: string) => {
    const confirmDelete = window.confirm("정말로 이 프롬프트를 삭제하시겠습니까?");
    if (confirmDelete) {
      const updatedPrompts = prompts.filter((prompt) => prompt.id !== id);
      setPrompts(updatedPrompts);
      localStorage.setItem("prompts", JSON.stringify(updatedPrompts));
      toast({
        title: "프롬프트가 삭제되었습니다.",
      });
    }
  };

  const handleCopyToClipboard = (content: string, title: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        const updatedPrompts = prompts.map(prompt => {
          if (prompt.title === title) {
            return { ...prompt, copyCount: (prompt.copyCount || 0) + 1 };
          }
          return prompt;
        });
        setPrompts(updatedPrompts);
        localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
        toast({
          title: "프롬프트가 클립보드에 복사되었습니다! ✅",
          description: "이제 바로 사용하실 수 있습니다.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "클립보드 복사에 실패했습니다 😢",
          description: "수동으로 복사해주세요.",
          variant: "destructive",
        });
      });
  };

  const handleLikePrompt = (id: string) => {
    if (!currentUser) {
      toast({
        title: "로그인이 필요합니다.",
        description: "프롬프트를 좋아하려면 먼저 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (likedPrompts.includes(id)) {
      // Unlike the prompt
      setLikedPrompts(likedPrompts.filter(promptId => promptId !== id));
      setPrompts(prompts.map(prompt =>
        prompt.id === id ? { ...prompt, likes: prompt.likes > 0 ? prompt.likes - 1 : 0 } : prompt
      ));
    } else {
      // Like the prompt
      setLikedPrompts([...likedPrompts, id]);
      setPrompts(prompts.map(prompt =>
        prompt.id === id ? { ...prompt, likes: prompt.likes + 1 } : prompt
      ));
    }
  
    localStorage.setItem('prompts', JSON.stringify(prompts));
  };

  const handleViewPrompt = (id: string) => {
    setPrompts(prompts.map(prompt =>
      prompt.id === id ? { ...prompt, views: prompt.views + 1 } : prompt
    ));
    localStorage.setItem('prompts', JSON.stringify(prompts));
  };

  const handleAddComment = (promptId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    if (!currentUser) {
      toast({
        title: "로그인이 필요합니다.",
        description: "댓글을 작성하려면 먼저 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    const newComment: Comment = {
      id: Date.now().toString(),
      author: comment.author,
      content: comment.content,
      password: comment.password,
      createdAt: new Date(),
    };

    const updatedPrompts = prompts.map(prompt => {
      if (prompt.id === promptId) {
        return { ...prompt, comments: [...prompt.comments, newComment] };
      }
      return prompt;
    });

    setPrompts(updatedPrompts);
    localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
    toast({
      title: "댓글이 등록되었습니다.",
    });
  };

  const handleEditComment = (promptId: string, commentId: string, content: string) => {
    const updatedPrompts = prompts.map(prompt => {
      if (prompt.id === promptId) {
        const updatedComments = prompt.comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, content: content };
          }
          return comment;
        });
        return { ...prompt, comments: updatedComments };
      }
      return prompt;
    });

    setPrompts(updatedPrompts);
    localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
    toast({
      title: "댓글이 수정되었습니다.",
    });
  };

  const handleDeleteComment = (promptId: string, commentId: string) => {
    const updatedPrompts = prompts.map(prompt => {
      if (prompt.id === promptId) {
        const updatedComments = prompt.comments.filter(comment => comment.id !== commentId);
        return { ...prompt, comments: updatedComments };
      }
      return prompt;
    });

    setPrompts(updatedPrompts);
    localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
    toast({
      title: "댓글이 삭제되었습니다.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <header className="bg-white dark:bg-gray-800 shadow-md py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            프롬프트 공유 플랫폼
          </h1>
          {currentUser ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-300">
                {currentUser} 님
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="프롬프트 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full max-w-2xl text-base border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:ring-2 focus:ring-[#A50034] focus:border-transparent"
              />
            </div>

            {/* Role Filter Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              {roleOptions.map((role) => (
                <Button
                  key={role}
                  variant={selectedRole === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                  className={`px-6 py-2 rounded-full transition-all duration-200 ${
                    selectedRole === role
                      ? "bg-[#A50034] hover:bg-[#8B002B] text-white shadow-md"
                      : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-[#A50034] dark:hover:text-[#A50034] hover:border-[#A50034] dark:hover:border-[#A50034] bg-white/70 dark:bg-gray-800/70"
                  }`}
                >
                  {role}
                </Button>
              ))}
            </div>

            {/* Sort and Filter Options */}
            <div className="flex flex-wrap gap-4 mb-6">
              <FilterDropdown
                label="정렬"
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
              />
              <FilterDropdown
                label="타입"
                options={typeOptions}
                value={selectedType}
                onChange={setSelectedType}
              />
            </div>
          </div>

          {/* Right Side Buttons */}
          <div className="flex flex-col gap-3 ml-6">
            <Button
              onClick={() => setIsPromptDialogOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-[#A50034] via-[#B8003D] to-[#8B002B] hover:from-[#8B002B] hover:via-[#A50034] hover:to-[#730024] text-white shadow-xl hover:shadow-2xl px-6 py-3 text-base font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              새 프롬프트 등록
            </Button>

            {currentUser ? (
              <>
                <Button
                  onClick={() => setViewFilter('myPrompts')}
                  variant={viewFilter === 'myPrompts' ? "default" : "outline"}
                  size="sm"
                  className={`px-4 py-2 text-sm ${
                    viewFilter === 'myPrompts'
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-blue-300 text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  내가 올린 프롬프트
                </Button>

                <Button
                  onClick={() => setViewFilter('likedPrompts')}
                  variant={viewFilter === 'likedPrompts' ? "default" : "outline"}
                  size="sm"
                  className={`px-4 py-2 text-sm ${
                    viewFilter === 'likedPrompts'
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "border-red-300 text-red-600 hover:bg-red-50"
                  }`}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  좋아요한 프롬프트
                </Button>

                {viewFilter !== 'all' && (
                  <Button
                    onClick={() => setViewFilter('all')}
                    variant="outline"
                    size="sm"
                    className="px-4 py-2 text-sm border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    전체 보기
                  </Button>
                )}
              </>
            ) : (
              <Button
                onClick={() => setIsLoginDialogOpen(true)}
                variant="outline"
                size="sm"
                className="px-4 py-2 text-sm border-[#A50034] text-[#A50034] hover:bg-[#A50034] hover:text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                로그인
              </Button>
            )}
          </div>
        </div>

        {/* Prompts Grid */}
        {filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onCopy={handleCopyToClipboard}
                onLike={handleLikePrompt}
                onView={() => {
                  handleViewPrompt(prompt.id);
                  setSelectedPrompt(prompt);
                }}
                onEdit={currentUser === prompt.author ? handleEditPrompt : undefined}
                onDelete={currentUser === prompt.author ? handleDeletePrompt : undefined}
                isAdmin={currentUser === 'admin'}
                isLiked={likedPrompts.includes(prompt.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>검색 결과가 없습니다.</p>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <PromptRegistration
        isOpen={isPromptDialogOpen}
        onClose={() => setIsPromptDialogOpen(false)}
        onSubmit={handlePromptSubmit}
        editPrompt={editingPrompt}
      />

      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLogin={handleLogin}
      />

      <PromptDialog
        prompt={selectedPrompt}
        isOpen={!!selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
        onCopy={handleCopyToClipboard}
        onLike={handleLikePrompt}
        onAddComment={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        onEdit={currentUser === selectedPrompt?.author ? handleEditPrompt : undefined}
        onDelete={currentUser === selectedPrompt?.author ? handleDeletePrompt : undefined}
        isAdmin={currentUser === 'admin'}
        currentUser={currentUser}
        likedPrompts={likedPrompts}
      />
    </div>
  );
};

export default Index;
