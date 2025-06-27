
import { useState } from "react";
import { Copy, CheckCircle, ThumbsUp, Eye, MessageCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface PromptCardProps {
  prompt: Prompt;
  onCopy: (content: string, title: string) => void;
  onLike: (id: string) => void;
  onViewContent: (prompt: Prompt) => void;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
  currentUser?: string;
  likedPrompts?: string[];
}

const PromptCard = ({ 
  prompt, 
  onCopy, 
  onLike, 
  onViewContent, 
  onEdit, 
  onDelete, 
  isAdmin = false,
  currentUser,
  likedPrompts = []
}: PromptCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    // HTML 태그 제거하고 텍스트만 추출
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = prompt.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    onCopy(textContent, prompt.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(prompt.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(prompt);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(prompt.id);
  };

  const handleCardClick = () => {
    onViewContent(prompt);
  };

  const canEditDelete = isAdmin || (currentUser && currentUser === prompt.author);
  const isLiked = likedPrompts.includes(prompt.id);

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:scale-[1.02] hover:border-[#A50034] dark:hover:border-[#A50034] flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {prompt.title}
          </CardTitle>
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary" className="bg-[#A50034]/10 dark:bg-[#A50034]/20 text-[#A50034] dark:text-[#A50034] rounded-full">
              {prompt.role}
            </Badge>
            <Badge variant="outline" className="border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 rounded-full">
              {prompt.type}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`text-gray-500 hover:text-[#A50034] dark:text-gray-400 dark:hover:text-[#A50034] hover:bg-[#A50034]/10 dark:hover:bg-[#A50034]/20 p-1 h-auto ${
                isLiked ? 'text-[#A50034] dark:text-[#A50034]' : ''
              }`}
            >
              <ThumbsUp className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{prompt.likes}</span>
            </Button>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{prompt.views}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{prompt.comments.length}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Copy className="w-4 h-4" />
              <span className="text-sm">{prompt.copyCount || 0}</span>
            </div>
          </div>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {prompt.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-4">
          {canEditDelete && (
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  수정
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  삭제
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-end mt-auto pt-4">
          <Button
            onClick={handleCopy}
            size="lg"
            className={`transition-all duration-200 px-6 py-3 text-base font-semibold ${
              copied 
                ? "bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white shadow-xl" 
                : "bg-gradient-to-r from-[#A50034] via-[#B8003D] to-[#8B002B] hover:from-[#8B002B] hover:via-[#A50034] hover:to-[#730024] text-white shadow-xl hover:shadow-2xl"
            }`}
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                복사됨!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                프롬프트 복사
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptCard;
