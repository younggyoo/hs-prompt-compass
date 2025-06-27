import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Copy, ThumbsUp, Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import PromptCard from '@/components/PromptCard';
import PromptDialog from '@/components/PromptDialog';
import PromptRegistration from '@/components/PromptRegistration';
import AdminMode from '@/components/AdminMode';
import FilterDropdown from '@/components/FilterDropdown';
import { Input } from "@/components/ui/input";

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
  likes: number;
  views: number;
  copyCount: number;
  comments: Comment[];
  createdAt: Date;
}

const Index = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [selectedRole, setSelectedRole] = useState('전체');
  const [selectedType, setSelectedType] = useState('전체');
  const [sortBy, setSortBy] = useState('생성일순');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editPrompt, setEditPrompt] = useState<Prompt | null>(null);
  const [likedPrompts, setLikedPrompts] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const storedLikes = localStorage.getItem('likedPrompts');
      return storedLikes ? JSON.parse(storedLikes) : [];
    }
    return [];
  });
  const currentUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;

  const fetchPrompts = useCallback(async () => {
    try {
      const response = await fetch('/api/prompts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error("프롬프트를 가져오는 중 오류 발생:", error);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  useEffect(() => {
    localStorage.setItem('likedPrompts', JSON.stringify(likedPrompts));
  }, [likedPrompts]);

  const sortPrompts = (prompts: Prompt[], sortBy: string) => {
    switch (sortBy) {
      case '좋아요순':
        return [...prompts].sort((a, b) => b.likes - a.likes);
      case '조회순':
        return [...prompts].sort((a, b) => b.views - a.views);
      case '프롬프트 복사순':
        return [...prompts].sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0));
      case '생성일순':
      default:
        return [...prompts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  };

  useEffect(() => {
    let filtered = [...prompts];

    if (selectedRole !== '전체') {
      filtered = filtered.filter(prompt => prompt.role === selectedRole);
    }

    if (selectedType !== '전체') {
      filtered = filtered.filter(prompt => prompt.type === selectedType);
    }

    if (debouncedSearchTerm) {
      const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        prompt =>
          prompt.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          prompt.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          prompt.content.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    const sortedPrompts = sortPrompts(filtered, sortBy);
    setFilteredPrompts(sortedPrompts);
  }, [prompts, debouncedSearchTerm, selectedRole, selectedType, sortBy]);

  const handleAdminToggle = (isAdmin: boolean) => {
    setIsAdmin(isAdmin);
  };

  const handleOpenDialog = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsDialogOpen(true);
    incrementViewCount(prompt.id);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPrompt(null);
  };

  const handleOpenRegistration = () => {
    setIsRegistrationOpen(true);
    setEditPrompt(null);
  };

  const handleCloseRegistration = () => {
    setIsRegistrationOpen(false);
    setEditPrompt(null);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditPrompt(prompt);
    setIsRegistrationOpen(true);
  };

  const handleRegisterPrompt = async (promptData: {
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
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      fetchPrompts();
    } catch (error) {
      console.error("프롬프트 등록 중 오류 발생:", error);
    }
  };

  const handleUpdatePrompt = async (promptId: string, promptData: {
    title: string;
    role: string;
    type: string;
    description: string;
    content: string;
    result?: string;
    tool?: string;
    author: string;
    password?: string;
  }) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      fetchPrompts();
    } catch (error) {
      console.error("프롬프트 업데이트 중 오류 발생:", error);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      fetchPrompts();
      handleCloseDialog();
    } catch (error) {
      console.error("프롬프트 삭제 중 오류 발생:", error);
    }
  };

  const handleLikePrompt = async (promptId: string) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedPrompt = await response.json();
      setPrompts(prevPrompts =>
        prevPrompts.map(prompt =>
          prompt.id === promptId ? { ...prompt, likes: updatedPrompt.likes } : prompt
        )
      );
      setLikedPrompts(prevLikes => {
        if (prevLikes.includes(promptId)) {
          return prevLikes.filter(id => id !== promptId);
        } else {
          return [...prevLikes, promptId];
        }
      });
    } catch (error) {
      console.error("프롬프트 좋아요 중 오류 발생:", error);
    }
  };

  const handleCopyPrompt = async (promptId: string) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/copy`, {
        method: 'POST',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const updatedPrompt = await response.json();
      setPrompts(prevPrompts =>
        prevPrompts.map(prompt =>
          prompt.id === promptId ? { ...prompt, copyCount: updatedPrompt.copyCount } : prompt
        )
      );
    } catch (error) {
      console.error("프롬프트 복사 횟수 업데이트 중 오류 발생:", error);
    }
  };

  const incrementViewCount = async (promptId: string) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/view`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedPrompt = await response.json();
      setPrompts(prevPrompts =>
        prevPrompts.map(prompt =>
          prompt.id === promptId ? { ...prompt, views: updatedPrompt.views } : prompt
        )
      );
    } catch (error) {
      console.error("프롬프트 조회수 업데이트 중 오류 발생:", error);
    }
  };

  const handleAddComment = async (promptId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comment),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const updatedPrompt = await response.json();
      setPrompts(prevPrompts =>
        prevPrompts.map(prompt =>
          prompt.id === promptId ? { ...prompt, comments: updatedPrompt.comments } : prompt
        )
      );
    } catch (error) {
      console.error("댓글 추가 중 오류 발생:", error);
    }
  };

  const handleEditComment = async (promptId: string, commentId: string, content: string) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const updatedPrompt = await response.json();
      setPrompts(prevPrompts =>
        prevPrompts.map(prompt =>
          prompt.id === promptId ? { ...prompt, comments: updatedPrompt.comments } : prompt
        )
      );
    } catch (error) {
      console.error("댓글 수정 중 오류 발생:", error);
    }
  };

  const handleDeleteComment = async (promptId: string, commentId: string) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/comments/${commentId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const updatedPrompt = await response.json();
      setPrompts(prevPrompts =>
        prevPrompts.map(prompt =>
          prompt.id === promptId ? { ...prompt, comments: updatedPrompt.comments } : prompt
        )
      );
    } catch (error) {
      console.error("댓글 삭제 중 오류 발생:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-800 dark:to-blue-900">
      {/* Header Section */}
      <header className="bg-white dark:bg-slate-900 shadow-md py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#A50034] dark:text-[#A50034]">
            프롬프트 공유 플랫폼
          </h1>
          <div className="flex gap-4 items-center">
            <Button variant="default" size="sm" onClick={handleOpenRegistration}>
              새 프롬프트 등록
            </Button>
            <AdminMode isAdmin={isAdmin} onAdminToggle={handleAdminToggle} prompts={prompts} />
          </div>
        </div>
      </header>

      {/* 검색 및 필터 섹션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          {/* Search Bar */}
          <Input
            type="search"
            placeholder="프롬프트 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          <div className="flex flex-wrap gap-3 mb-4">
            <FilterDropdown
              label="역할"
              options={['전체', 'R&D', '기획', '구매', '생산', 'SCM', '품질', '영업/마케팅', '공통']}
              value={selectedRole}
              onChange={setSelectedRole}
              isRole={true}
            />
            <FilterDropdown
              label="타입"
              options={['전체', '아이디어', '요약', '분석', '작성', '번역', '편집']}
              value={selectedType}
              onChange={setSelectedType}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">정렬:</span>
            <FilterDropdown
              label=""
              options={['생성일순', '좋아요순', '조회순', '프롬프트 복사순']}
              value={sortBy}
              onChange={setSortBy}
            />
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map(prompt => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onCopy={(content, title) => {
                navigator.clipboard.writeText(content);
                handleCopyPrompt(prompt.id);
                alert(`${title} 프롬프트 복사 완료!`);
              }}
              onLike={handleLikePrompt}
              onViewContent={handleOpenDialog}
              onEdit={isAdmin ? handleEditPrompt : undefined}
              onDelete={isAdmin ? handleDeletePrompt : undefined}
              isAdmin={isAdmin}
              currentUser={currentUser || undefined}
              likedPrompts={likedPrompts}
            />
          ))}
        </div>
      </main>

      {/* Prompt Dialog */}
      <PromptDialog
        prompt={selectedPrompt}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onCopy={(content, title) => {
          navigator.clipboard.writeText(content);
          handleCopyPrompt(selectedPrompt?.id || '');
          alert(`${title} 프롬프트 복사 완료!`);
        }}
        onLike={handleLikePrompt}
        onAddComment={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        onEdit={isAdmin ? handleEditPrompt : undefined}
        onDelete={isAdmin ? handleDeletePrompt : undefined}
        isAdmin={isAdmin}
        likedPrompts={likedPrompts}
      />

      {/* Prompt Registration Dialog */}
      <PromptRegistration
        isOpen={isRegistrationOpen}
        onClose={handleCloseRegistration}
        onSubmit={editPrompt ? (promptData) => handleUpdatePrompt(editPrompt.id, promptData) : handleRegisterPrompt}
        editPrompt={editPrompt}
      />
    </div>
  );
};

export default Index;
