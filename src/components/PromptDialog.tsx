
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, ThumbsUp, Eye, MessageCircle, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import CommentSection from "./CommentSection";

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

interface PromptDialogProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onCopy: (content: string, title: string) => void;
  onLike: (id: string) => void;
  onAddComment: (promptId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  onEditComment?: (promptId: string, commentId: string, content: string) => void;
  onDeleteComment?: (promptId: string, commentId: string) => void;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
  likedPrompts?: string[];
}

const PromptDialog = ({ 
  prompt, 
  isOpen, 
  onClose, 
  onCopy, 
  onLike, 
  onAddComment, 
  onEditComment,
  onDeleteComment,
  onEdit, 
  onDelete, 
  isAdmin = false,
  likedPrompts = []
}: PromptDialogProps) => {
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  const handleCopy = () => {
    // HTML 태그 제거하고 텍스트만 추출
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = prompt.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    onCopy(textContent, prompt.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    onLike(prompt.id);
  };

  const canEditDelete = isAdmin || prompt.password;
  const isLiked = likedPrompts.includes(prompt.id);

  // HTML에서 텍스트만 추출하는 함수
  const extractTextFromHtml = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {prompt.title}
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="bg-[#A50034]/10 dark:bg-[#A50034]/20 text-[#A50034] dark:text-[#A50034] rounded-full">
              {prompt.role}
            </Badge>
            <Badge variant="outline" className="border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 rounded-full">
              {prompt.type}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {prompt.description}
          </p>
          {prompt.tool && (
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🛠️ 사용 가능 Tool: </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{prompt.tool}</span>
            </div>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            작성자: <span className="text-[#A50034] font-medium">{prompt.author}</span>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
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

          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📄 프롬프트 내용</h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: prompt.content }} />
            </div>
          </div>

          {prompt.result && (
            <div className="bg-[#A50034]/5 dark:bg-[#A50034]/10 rounded-lg p-4 border border-[#A50034]/20 dark:border-[#A50034]/30">
              <h3 className="font-semibold text-[#A50034] dark:text-[#A50034] mb-3">✨ 프롬프트 결과</h3>
              <div className="text-sm text-[#A50034] dark:text-[#A50034] leading-relaxed whitespace-pre-wrap prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: prompt.result }} />
              </div>
            </div>
          )}

          {canEditDelete && (
            <div className="flex gap-2 pt-4 border-t">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(prompt)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  수정
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(prompt.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  삭제
                </Button>
              )}
            </div>
          )}

          <CommentSection
            promptId={prompt.id}
            comments={prompt.comments}
            onAddComment={onAddComment}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
          />

          <div className="flex items-center justify-end pt-4 border-t">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromptDialog;
