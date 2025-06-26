
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, ThumbsUp, Eye, MessageCircle } from "lucide-react";
import { useState } from "react";
import CommentSection from "./CommentSection";

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
  likes: number;
  views: number;
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
}

const PromptDialog = ({ prompt, isOpen, onClose, onCopy, onLike, onAddComment }: PromptDialogProps) => {
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  const handleCopy = () => {
    onCopy(prompt.content, prompt.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    onLike(prompt.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {prompt.title}
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="bg-[#A50034]/10 dark:bg-[#A50034]/20 text-[#A50034] dark:text-[#A50034]">
              {prompt.role}
            </Badge>
            <Badge variant="outline" className="border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300">
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
              className="text-gray-500 hover:text-[#A50034] dark:text-gray-400 dark:hover:text-[#A50034] hover:bg-[#A50034]/10 dark:hover:bg-[#A50034]/20 p-1 h-auto"
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
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
          </div>

          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📄 프롬프트 내용</h3>
            <div 
              className="text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: prompt.content }}
            />
          </div>

          {prompt.result && (
            <div className="bg-[#A50034]/5 dark:bg-[#A50034]/10 rounded-lg p-4 border border-[#A50034]/20 dark:border-[#A50034]/30">
              <h3 className="font-semibold text-[#A50034] dark:text-[#A50034] mb-3">✨ 프롬프트 결과</h3>
              <div 
                className="text-sm text-[#A50034] dark:text-[#A50034] leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: prompt.result }}
              />
            </div>
          )}

          <CommentSection
            promptId={prompt.id}
            comments={prompt.comments}
            onAddComment={onAddComment}
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
                  📋 복사됨!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2" />
                  📋 프롬프트 복사
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
